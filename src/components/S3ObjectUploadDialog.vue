<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';

import AlertComponent from '@/components/common/AlertComponent.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import useSvgIcons from '@/composables/useSvgIcons';
import {
  type FileEventTarget,
  type S3UploadFile,
  type S3UploadParams,
  InfiniteScrollerStatus,
  InfiniteScrollerSide,
} from '@/interfaces/CloudStorageInterface';
import { formatBytes } from '@/utils/utils';

type DropFile = FileRecord | DisplayItem;

interface FileRecord {
  file: File;
  path: string;
}

interface DisplayItem {
  name: string;
  isFolder: boolean;
  count: number;
  size: number;
  folderInvalidCount?: number; // 計算 folder 中不符合限制的檔案數
  folderUploadTotalSize?: number; // 計算 folder 實際上傳的大小
}

const showDialog = defineModel<boolean>('show', { required: true });

const props = defineProps({
  bucketName: {
    type: String,
    default: '',
  },
  path: {
    type: String,
    default: '',
  },
  closeDialogCallback: {
    type: Function,
    default: undefined,
  },
});

const { IconKeys, ServiceIcons } = useSvgIcons();
const {
  s3UploadProgress,
  s3UploadRequest,
  s3AbortUploadList,
  execBatchUploadS3Objects,
} = useCloudStorage();

const RENDER_LENGTH = 20;
const BATCH_UPLOAD_LIMIT_NUM = 3;
const MAX_FILE_SIZE = 46 * 1024 * 1024 * 1024;
const enum UPLOAD_STATUS {
  INIT = 'init',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  ERROR = 'error',
  FINISHED = 'finished',
}

const scrollRef = ref<any>(null);
const loadCount = ref<number>(1);
const infiniteList = ref<DisplayItem[]>([]);
const displayItems = ref<DisplayItem[]>([]);
const uploadFileList = ref<S3UploadFile[]>([]);
const uploadStatus = ref<UPLOAD_STATUS>(UPLOAD_STATUS.INIT);
const dropFileRef = ref<any>(null);
const isDragEnter = ref<boolean>(false);
const dropFileList = ref<DropFile[]>([]);
const loading = ref<boolean>(false);
const displayUploadProgress = ref<Record<string, number>>({});
const errorFolderInfo = ref<Record<string, string[]>>({}); // {[folderName]: errorFileNames}

const totalSize = computed(() => {
  let size = 0;
  uploadFileList.value.forEach(file => {
    if (file.size <= MAX_FILE_SIZE) {
      size += file.size;
    }
  });
  return size;
});

const totalCount = computed(() => {
  return uploadFileList.value.filter(
    file => !file.isFolder && file.size <= MAX_FILE_SIZE
  ).length;
});

const uploadCount = computed(() => {
  return uploadFileList.value.filter(
    file => !!file.isFolder || (!file.isFolder && file.size <= MAX_FILE_SIZE)
  ).length;
});

const submitAction = () => {
  if (
    uploadFileList.value.length > 0 &&
    uploadStatus.value === UPLOAD_STATUS.INIT
  ) {
    void uploadFiles();
  } else if (uploadStatus.value === UPLOAD_STATUS.ERROR) {
    reuploadAll();
  } else {
    closeDialog();
  }
};

const closeDialog = () => {
  showDialog.value = false;
  if (uploadStatus.value !== UPLOAD_STATUS.INIT) {
    props.closeDialogCallback?.();
  }
};

// https://vuetifyjs.com/en/api/v-infinite-scroll/#events
// node_modules\vuetify\lib\components\index.d.mts
type loadEvent = (options: {
  side: string;
  done: (status: InfiniteScrollerStatus) => void;
}) => any;

const load: loadEvent = ({ side, done }) => {
  if (infiniteList.value.length <= RENDER_LENGTH) {
    done(InfiniteScrollerStatus.OK);
    return;
  }

  const virtualLength = RENDER_LENGTH / 2;
  if (side === InfiniteScrollerSide.START) {
    if (loadCount.value === 1) {
      done(InfiniteScrollerStatus.OK);
      return;
    }
    loadCount.value -= 1;
    displayItems.value = [
      ...infiniteList.value.slice(
        virtualLength * (loadCount.value - 1),
        virtualLength * loadCount.value
      ),
      ...displayItems.value.slice(0, virtualLength),
    ];
    void nextTick(() => {
      scrollRef.value.$el.scrollTop = 2 * 48;
    });
  } else {
    if (
      loadCount.value + 1 ===
        Math.floor(infiniteList.value.length / virtualLength) &&
      infiniteList.value.length % virtualLength === 0
    ) {
      done(InfiniteScrollerStatus.OK);
      return;
    } else if (
      loadCount.value === Math.floor(infiniteList.value.length / virtualLength)
    ) {
      done(InfiniteScrollerStatus.OK);
      return;
    }

    loadCount.value += 1;
    displayItems.value = [
      ...displayItems.value.slice(virtualLength),
      ...infiniteList.value.slice(
        virtualLength * loadCount.value,
        virtualLength * (loadCount.value + 1)
      ),
    ];
  }

  done(InfiniteScrollerStatus.OK);
};

const fileChange = (e: Event) => {
  const files = [...(e.target as FileEventTarget).files];
  const newFiles = files.filter(
    file =>
      !uploadFileList.value.some(uploadFile => {
        return uploadFile.name === file.name;
      })
  );
  uploadFileList.value = [
    ...uploadFileList.value.concat(newFiles as S3UploadFile[]),
  ];
};

const removeFile = (file: DisplayItem) => {
  if (file.isFolder) {
    uploadFileList.value = uploadFileList.value.filter(
      uploadFile => !uploadFile.name.startsWith(file.name)
    );
  } else {
    const index = uploadFileList.value.findIndex(
      uploadFile => uploadFile.name === file.name
    );
    uploadFileList.value.splice(index, 1);
    uploadFileList.value = [...uploadFileList.value];
  }
};

const abortUpload = (file: DisplayItem) => {
  const fileKey = props.path + file.name;
  s3AbortUploadList.value.push(fileKey);
  if (file.isFolder) {
    const requestKeys = Object.keys(s3UploadRequest.value);
    const abortKeys = requestKeys.filter(key => key.startsWith(fileKey));
    abortKeys.forEach(key => {
      if (
        s3UploadProgress.value[key] &&
        s3UploadProgress.value[key].percentage !== 100
      ) {
        void s3UploadRequest.value[key].abort();
      }
    });
  } else {
    if (
      s3UploadProgress.value[fileKey] &&
      s3UploadProgress.value[fileKey].percentage !== 100
    ) {
      void s3UploadRequest.value[fileKey].abort();
    }
  }
};

const uploadFiles = async () => {
  uploadStatus.value = UPLOAD_STATUS.UPLOADING;

  const sortedFiles = uploadFileList.value
    .filter(file => file.size <= MAX_FILE_SIZE)
    .sort((a, b) => {
      const aValue = a.name;
      const bValue = b.name;
      if (aValue === bValue) {
        return 0;
      }
      return aValue > bValue ? 1 : -1;
    })
    .map(file => ({
      Bucket: props.bucketName,
      Key: props.path + file.name,
      Body: file.isFolder ? '' : file,
      ContentType: file.type,
    }));

  const batchUploadParamsGroup = [];
  let count = 0;
  while (count * BATCH_UPLOAD_LIMIT_NUM < sortedFiles.length) {
    batchUploadParamsGroup.push(
      sortedFiles.slice(
        count * BATCH_UPLOAD_LIMIT_NUM,
        (count + 1) * BATCH_UPLOAD_LIMIT_NUM
      )
    );
    count += 1;
  }

  await execBatchUploadS3Objects(batchUploadParamsGroup, props.path);
  uploadStatus.value = UPLOAD_STATUS.FINISHED;
};

const onDragEnter = () => {
  isDragEnter.value = true;
};

const onDragLeave = () => {
  isDragEnter.value = false;
};

const onDrop = async (e: DragEvent) => {
  e.preventDefault();
  loading.value = true;
  isDragEnter.value = false;
  if (dropFileRef.value?.$el) {
    dropFileRef.value.$el.value = null;
  }

  const items = [...(e.dataTransfer?.items ?? [])];
  let tmpDropFile: DropFile[] = [];
  const entries = [];
  for (let i = 0; i < items.length; i++) {
    entries.push(items[i].webkitGetAsEntry());
  }
  for (const entry of entries) {
    if (entry) {
      const fileTree = await traverseFileTree(entry);
      tmpDropFile = tmpDropFile.concat(fileTree);
    }
  }
  dropFileList.value = [...tmpDropFile];
  loading.value = false;
};

const checkDropFileIsFolder = (item: DropFile): item is DisplayItem =>
  'isFolder' in item;

const traverseFileTree = async (
  item: FileSystemEntry,
  path = ''
): Promise<DropFile[]> => {
  let fileTree: DropFile[] = [];
  return await new Promise(resolve => {
    if (item.isFile) {
      (item as FileSystemFileEntry).file((file: File) => {
        fileTree.push({
          file,
          path,
        });
        resolve(fileTree);
      });
    } else if (item.isDirectory) {
      const folderName = `${path}${item.name}/`;
      const index = uploadFileList.value.findIndex(
        (file: S3UploadFile) => file.name === folderName
      );
      if (index > -1) {
        uploadFileList.value = uploadFileList.value.filter(
          (obj: S3UploadFile) => !obj.name.startsWith(folderName)
        );
      }

      fileTree.push({
        name: folderName,
        isFolder: true,
        count: 0,
        size: 0,
      });

      // To read all files in a directory, readEntries needs to be called repeatedly until it returns an empty array.
      const dirReader = (item as FileSystemDirectoryEntry).createReader();
      const readEntriesFunc = async (folderIndex: number) =>
        dirReader.readEntries((entries: FileSystemEntry[]) => {
          void (async () => {
            if (entries.length > 0) {
              if (checkDropFileIsFolder(fileTree[folderIndex])) {
                if (!fileTree[folderIndex].count) {
                  fileTree[folderIndex].count = 0;
                }
                fileTree[folderIndex].count += entries.filter(
                  (el: FileSystemEntry) => !el.isDirectory
                ).length;
              }
              for (const entry of entries) {
                const file = await traverseFileTree(entry, folderName);
                fileTree = fileTree.concat(file);
              }
              void readEntriesFunc(folderIndex);
            } else {
              resolve(fileTree);
            }
          })();
        });
      void readEntriesFunc(fileTree.length - 1);
    }
  });
};

const onClickDropFileArea = (e: MouseEvent) => {
  e.preventDefault();
};

const updateUploadProgress = () => {
  const keys = Object.keys(s3UploadProgress.value);
  const folderLoaded: Record<string, number> = {};
  errorFolderInfo.value = {};
  keys.forEach(key => {
    let displayName = key;
    if (props.path) {
      displayName = key.substring(props.path.length);
    }

    const index = displayName.indexOf('/');
    if (index !== -1) {
      // 資料夾內的檔案或資料夾: 以第一層資料夾為單位顯示上傳進度
      const folderName = displayName.substring(0, index + 1);
      if (typeof folderLoaded[folderName] === 'undefined') {
        folderLoaded[folderName] = 0;
      }

      // 1. 累計該資料夾的總 loaded: 各檔案已上傳的大小做累加
      if (s3UploadProgress.value[key].total !== undefined) {
        folderLoaded[folderName] +=
          s3UploadProgress.value[key].percentage !== -1 // 失敗的檔案在計算總數上要先視為完成, 故直接加上該檔案的總大小
            ? s3UploadProgress.value[key].total
            : (s3UploadProgress.value[key].percentage / 100) *
              s3UploadProgress.value[key].total;
      }

      if (s3UploadProgress.value[key].percentage === -1) {
        if (!errorFolderInfo.value[folderName]) {
          errorFolderInfo.value[folderName] = [];
        }

        errorFolderInfo.value[folderName].push(displayName);
      }

      // 資料夾的總大小已經有計算過並記錄在 infiniteList 中, 所以可以直接拿不用再計算一次
      const folderTotal = infiniteList.value.find(
        file => file.name === folderName
      )?.folderUploadTotalSize;

      // 2. 計算整個資料夾目前的上傳百分比
      if (folderTotal) {
        displayUploadProgress.value[folderName] =
          (folderLoaded[folderName] / folderTotal) * 100;
      } else {
        displayUploadProgress.value[folderName] = 100;
      }
    } else {
      // 檔案: 直接顯示該檔案的上傳百分比
      displayUploadProgress.value[displayName] =
        s3UploadProgress.value[key].percentage;
    }
  });
};

const getReuploadFolderParams = (folderName: string): S3UploadParams[] => {
  const folderKey = props.path + folderName;
  s3AbortUploadList.value = s3AbortUploadList.value.filter(
    item => item !== folderKey
  );

  const uploadParams: S3UploadParams[] = [];
  const errorFileNames = [...(errorFolderInfo.value?.[folderName] ?? [])];

  errorFolderInfo.value[folderName] = [];

  errorFileNames.forEach(fileName => {
    const matchFile = uploadFileList.value.find(
      uploadFile => uploadFile.name === fileName
    );
    if (matchFile) {
      const fileKey = props.path + fileName;
      const params = {
        Bucket: props.bucketName,
        Key: fileKey,
        Body: matchFile.isFolder ? '' : matchFile,
        ContentType: matchFile.type,
      };
      uploadParams.push(params);
      s3UploadProgress.value[fileKey] = {
        percentage: 0,
        total: s3UploadProgress.value[fileKey].total,
      };
    }
  });

  return uploadParams;
};

const getReuploadFileParams = (fileName: string): S3UploadParams[] => {
  const matchFile = uploadFileList.value.find(
    uploadFile => uploadFile.name === fileName
  );
  if (!matchFile) {
    return [];
  }
  const fileKey = props.path + fileName;
  s3AbortUploadList.value = s3AbortUploadList.value.filter(
    item => item !== fileKey
  );

  const params = {
    Bucket: props.bucketName,
    Key: fileKey,
    Body: matchFile.isFolder ? '' : matchFile,
    ContentType: matchFile.type,
  };

  return [params];
};

const reupload = (file: DisplayItem) => {
  uploadStatus.value = UPLOAD_STATUS.UPLOADING;
  let uploadParams: S3UploadParams[] = [];
  if (file.isFolder) {
    uploadParams = getReuploadFolderParams(file.name);
  } else {
    uploadParams = getReuploadFileParams(file.name);
  }

  void reuploadAction(uploadParams);
};

const reuploadAction = async (uploadParams: S3UploadParams[]) => {
  const batchUploadParamsGroup = [];
  let count = 0;
  while (count * BATCH_UPLOAD_LIMIT_NUM < uploadParams.length) {
    batchUploadParamsGroup.push(
      uploadParams.slice(
        count * BATCH_UPLOAD_LIMIT_NUM,
        (count + 1) * BATCH_UPLOAD_LIMIT_NUM
      )
    );
    count += 1;
  }
  await execBatchUploadS3Objects(batchUploadParamsGroup, props.path);
  uploadStatus.value = UPLOAD_STATUS.FINISHED;
};

const reuploadAll = () => {
  uploadStatus.value = UPLOAD_STATUS.UPLOADING;
  const reuploadFileNames = Object.keys(displayUploadProgress.value).filter(
    key =>
      displayUploadProgress.value?.[key] === -1 ||
      errorFolderInfo.value?.[key]?.length > 0
  );

  const uploadParams: S3UploadParams[] = [];
  reuploadFileNames.forEach(fileName => {
    if (fileName.endsWith('/')) {
      uploadParams.push(...getReuploadFolderParams(fileName));
    } else {
      uploadParams.push(...getReuploadFileParams(fileName));
    }
  });

  void reuploadAction(uploadParams);
};

const getErrorItemCount = (folderName: string) => {
  return (
    errorFolderInfo.value[folderName]?.filter(
      fileName => !fileName.endsWith('/')
    ).length ?? 0
  );
};

watch(showDialog, async val => {
  if (val) {
    uploadStatus.value = UPLOAD_STATUS.INIT;
    uploadFileList.value = [];
    displayItems.value = [];
    loadCount.value = 1;
    s3UploadProgress.value = {};
    displayUploadProgress.value = {};
    s3AbortUploadList.value = [];
    errorFolderInfo.value = {};
  }
});

watch(uploadStatus, newVal => {
  if (newVal === UPLOAD_STATUS.FINISHED) {
    const errorCount = Object.keys(displayUploadProgress.value).filter(
      key =>
        displayUploadProgress.value[key] === -1 ||
        errorFolderInfo.value[key]?.length > 0
    ).length;

    const completedCount = Object.keys(displayUploadProgress.value).filter(
      key => displayUploadProgress.value[key] === 100
    ).length;

    if (
      completedCount + errorCount > 0 &&
      completedCount + errorCount ===
        Object.keys(displayUploadProgress.value).length
    ) {
      if (errorCount > 0) {
        uploadStatus.value = UPLOAD_STATUS.ERROR;
      } else {
        uploadStatus.value = UPLOAD_STATUS.COMPLETED;
      }
    }
  }
});

watch(dropFileList, newVal => {
  if (!newVal || newVal.length === 0) return;
  newVal.forEach(dropFile => {
    const isFolder = checkDropFileIsFolder(dropFile);
    if (
      !uploadFileList.value.some(uploadFile => {
        return isFolder
          ? uploadFile.name === dropFile.name
          : uploadFile.name === `${dropFile.path}${dropFile.file.name}`;
      })
    ) {
      if (isFolder) {
        uploadFileList.value.push(new File([], dropFile.name));
        uploadFileList.value[uploadFileList.value.length - 1].isFolder = true;
        uploadFileList.value[uploadFileList.value.length - 1].count =
          dropFile.count;
      } else if (dropFile.file) {
        const file = dropFile.file;
        const path = dropFile.path;
        const name = `${path}${file.name}`;
        const renameFile = new File([file], name, {
          type: file.type,
          lastModified: file.lastModified,
        });
        uploadFileList.value.push(renameFile);
      }
    }
  });
  uploadFileList.value = [...uploadFileList.value];
  dropFileList.value = [];
});

watch(uploadFileList, newVal => {
  const fileList: DisplayItem[] = newVal.map(file => ({
    name: file.name ?? '',
    isFolder: file.isFolder ?? false,
    count: file.count ?? 0,
    size: file.size,
  }));

  fileList.forEach(file => {
    const splitFileName = file.name.split('/');
    const rootFolder = splitFileName[0];
    const index = fileList.findIndex(
      el => el.name === `${rootFolder}/` && el.name !== file.name
    );
    if (index > -1) {
      if (file.isFolder) {
        fileList[index].count += file.count;
      } else {
        fileList[index].size += file.size;
        if (file.size > MAX_FILE_SIZE) {
          if (!fileList[index].folderInvalidCount) {
            fileList[index].folderInvalidCount = 0;
          }
          fileList[index].folderInvalidCount += 1;
        } else {
          if (!fileList[index].folderUploadTotalSize) {
            fileList[index].folderUploadTotalSize = 0;
          }
          fileList[index].folderUploadTotalSize += file.size;
        }
      }
    }
  });

  infiniteList.value = fileList
    .filter(
      file =>
        file.name.split('/').length === 1 ||
        (file.name.split('/').length === 2 && file.name.split('/')[1] === '')
    )
    .sort((a, b) => {
      const aValue = a.name;
      const bValue = b.name;
      if (aValue === bValue) {
        return 0;
      }
      return aValue > bValue ? 1 : -1;
    });

  displayItems.value =
    infiniteList.value.length > RENDER_LENGTH
      ? infiniteList.value.slice(0, RENDER_LENGTH)
      : [...infiniteList.value];
});

watch(s3UploadProgress, updateUploadProgress, {
  deep: true,
});
</script>

<template>
  <CommonDialog
    v-model:show="showDialog"
    :show-cancel-btn="
      uploadStatus === UPLOAD_STATUS.INIT ||
      uploadStatus === UPLOAD_STATUS.ERROR
    "
    :title="$t('basic.upload')"
    :disable-submit="
      uploadStatus === UPLOAD_STATUS.UPLOADING || uploadCount === 0
    "
    :submit-btn-text="
      uploadStatus === UPLOAD_STATUS.ERROR ? $t('s3.upload.reuploadAll') : ''
    "
    :cancel-btn-text="uploadStatus === UPLOAD_STATUS.INIT ? '' : $t('basic.ok')"
    :cancel-callback="closeDialog"
    :submit-callback="submitAction"
    disable-auto-close-dialog
  >
    <template #info>
      <v-row no-gutters class="px-4">
        <v-col cols="12" class="ocis-content-key">
          {{
            $t('s3.upload.fileSize.message', {
              size: formatBytes(MAX_FILE_SIZE),
            })
          }}
        </v-col>
        <v-col cols="4" sm="2" class="ocis-content-key">
          {{ $t('label.name.type', { type: $t('s3.bucket') }) }}
        </v-col>
        <v-col cols="8" sm="4" class="ocis-content-value">
          {{ bucketName }}
        </v-col>

        <v-col cols="4" sm="2" class="ocis-content-key">
          {{ $t('s3.upload.path') }}
        </v-col>
        <v-col cols="8" sm="4" class="ocis-content-value">
          {{ `/${path}` }}
        </v-col>

        <v-col cols="4" sm="2" class="ocis-content-key">
          {{ $t('s3.upload.total') }}
        </v-col>
        <v-col cols="8" sm="4" class="ocis-content-value">
          {{
            $tc('basic.items', totalCount, {
              number: totalCount,
            })
          }}
        </v-col>

        <v-col cols="4" sm="2" class="ocis-content-key">
          {{ $t('label.size') }}
        </v-col>
        <v-col cols="8" sm="4" class="ocis-content-value">
          {{ formatBytes(totalSize) }}
        </v-col>
      </v-row>
    </template>
    <template #default>
      <input
        v-if="uploadStatus === UPLOAD_STATUS.INIT"
        ref="dropFileRef"
        class="input-file drop-file-area"
        :class="{ 'ignore-pointer-events': !isDragEnter }"
        type="file"
        accept="*/*"
        multiple
        aria-label="input-file"
        @change="fileChange($event)"
        @drop="onDrop($event)"
        @click="onClickDropFileArea($event)"
        @dragleave="onDragLeave"
      />
      <div @dragenter="onDragEnter">
        <v-row no-gutters class="border align-center header-row">
          <v-col cols="4">{{ $t('label.name') }}</v-col>
          <v-col cols="4">
            {{ $t('label.size') }}
          </v-col>
          <v-col cols="4" class="pl-2 d-flex justify-space-between">
            <span>{{ $t('s3.upload.progress') }}</span>
            <span v-if="uploadStatus === UPLOAD_STATUS.ERROR">
              {{ $t('s3.upload.reupload') }}
            </span>
          </v-col>
        </v-row>

        <v-progress-linear
          v-if="loading"
          height="4"
          indeterminate
          color="primary"
        />

        <v-infinite-scroll
          v-if="uploadFileList.length > 0"
          ref="scrollRef"
          height="40vh"
          max-height="400px"
          :side="InfiniteScrollerSide.BOTH"
          class="pa-0 scroll-view"
          @load="load"
        >
          <template v-for="file in displayItems" :key="file.name">
            <v-row no-gutters class="align-center item-row border">
              <v-col cols="4" class="single-ellipsis pr-2">
                {{ file.name }}
              </v-col>
              <v-col cols="4">
                <span v-if="file.isFolder">
                  {{
                    `${$tc('basic.items', file.count, { number: file.count })} - ${formatBytes(file.size)}`
                  }}
                  <div v-if="!!file.folderInvalidCount" class="text-error">
                    {{
                      $tc('s3.upload.fileSize.error', 2, {
                        number: file.folderInvalidCount,
                      })
                    }}
                  </div>
                </span>
                <span v-else>
                  {{ formatBytes(file.size) }}
                  <div v-if="file.size > MAX_FILE_SIZE" class="text-error">
                    {{ $t('s3.upload.fileSize.error') }}
                  </div>
                </span>
                <div
                  v-if="errorFolderInfo[file.name]?.length > 0"
                  class="text-error folder-error-info"
                >
                  {{
                    $t('s3.upload.folder.errorMessage', {
                      number: getErrorItemCount(file.name),
                    })
                  }}
                </div>
              </v-col>
              <v-col cols="4" class="d-flex align-center pl-2">
                <v-progress-linear
                  v-model="displayUploadProgress[file.name]"
                  class="mr-2 upload-progress"
                  :color="
                    (!file.isFolder && file.size > MAX_FILE_SIZE) ||
                    displayUploadProgress[file.name] === -1 ||
                    errorFolderInfo[file.name]?.length > 0
                      ? 'error'
                      : 'primary'
                  "
                />
                <span class="upload-progress-percentage">
                  {{
                    displayUploadProgress[file.name] &&
                    displayUploadProgress[file.name] !== -1 &&
                    (!errorFolderInfo[file.name] ||
                      errorFolderInfo[file.name].length === 0)
                      ? `${displayUploadProgress[file.name].toFixed(0)}%`
                      : ''
                  }}
                </span>
                <span class="upload-icon">
                  <v-icon
                    v-if="uploadStatus === UPLOAD_STATUS.INIT"
                    @click="removeFile(file)"
                  >
                    mdi-close
                  </v-icon>
                  <v-icon
                    v-else-if="
                      uploadStatus === UPLOAD_STATUS.UPLOADING &&
                      !s3AbortUploadList.includes(
                        `${props.path}${file.name}`
                      ) &&
                      displayUploadProgress[file.name] !== -1 &&
                      displayUploadProgress[file.name] !== 100
                    "
                    @click="abortUpload(file)"
                  >
                    mdi-close
                  </v-icon>
                  <v-icon
                    v-else-if="
                      uploadStatus === UPLOAD_STATUS.ERROR &&
                      s3AbortUploadList.includes(`${props.path}${file.name}`) &&
                      (displayUploadProgress[file.name] === -1 ||
                        errorFolderInfo[file.name]?.length > 0)
                    "
                    @click="reupload(file)"
                  >
                    mdi-refresh
                  </v-icon>
                </span>
              </v-col>
            </v-row>
          </template>
          <template #empty />
        </v-infinite-scroll>
        <div v-else class="text-center align-content-center no-data">
          <component :is="ServiceIcons[IconKeys.add_file].svg" class="mb-2" />
          <div>
            <div class="mt-3">{{ $t('s3.upload.dragFile') }}</div>
            <div>{{ $t('label.or') }}</div>
            <ContainedBtn :text="$t('s3.upload.selectFile')">
              <input
                class="input-file"
                type="file"
                multiple
                accept="*/*"
                aria-label="input-file"
                @change="fileChange($event)"
              />
            </ContainedBtn>
          </div>
        </div>
      </div>
    </template>
    <template #custom-alert>
      <div class="upload-alert px-3 mt-3">
        <AlertComponent
          v-if="uploadStatus === UPLOAD_STATUS.ERROR"
          :message="$t('s3.upload.error')"
        />
        <AlertComponent
          v-else-if="uploadStatus === UPLOAD_STATUS.COMPLETED"
          :message="$t('s3.upload.completed')"
          type="success"
        />
      </div>
    </template>
    <template #actions-prepend>
      <ContainedBtn
        v-if="uploadFileList.length > 0 && uploadStatus === UPLOAD_STATUS.INIT"
        :text="$t('s3.upload.selectFile')"
      >
        <input
          class="input-file"
          type="file"
          multiple
          accept="*/*"
          aria-label="input-file"
          @change="fileChange($event)"
        />
      </ContainedBtn>
    </template>
  </CommonDialog>
</template>

<style scoped lang="scss">
.header-row {
  min-height: 48px;
  max-height: 48px;
  padding: 0px 8px 0px 16px;
  &:has(.folder-error-info) {
    max-height: 64px;
  }
}

.scroll-view {
  width: 100%;
  .item-row {
    min-height: 48px;
    max-height: 48px;
    border-top: 0px !important;
    padding: 0px 8px 0px 16px;
  }
  :deep(.v-infinite-scroll__side) {
    padding: 0px !important;
    .v-progress-circular {
      display: none;
    }
  }
}

.no-data {
  height: 40vh;
  max-height: 400px;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
  text-indent: -100px;
  z-index: 100;
  &.drop-file-area {
    top: 0;
    left: 0;
    cursor: default !important;
    &.ignore-pointer-events {
      pointer-events: none;
    }
  }
}

.upload-file-area {
  height: 40vh;
  max-height: 400px;
  width: 100%;
}

.upload-progress-percentage {
  width: 40px !important;
  min-height: 20px !important;
}

.upload-icon {
  width: 56px !important;
}

.single-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
