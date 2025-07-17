<script setup lang="ts">
import { Buffer } from 'buffer';

import { useGlobal } from '@/store';
import { ref, computed, watch, type Ref, onMounted } from 'vue';

import type {
  Flavor,
  Image,
  Network,
  Volume,
  FormError,
  Keypair,
} from '@/interfaces/VmInterface';

import {
  makeApiCall,
  fetchVmImagesPrivate,
  fetchVmImagesPublic,
  fetchVmFlavors,
  fetchVmKeypairs,
  createVm,
  fetchVmVolumes,
  fetchVmSecurityGroups,
  fetchVmNetworks,
  fetchVmVolumeTypes,
} from '@/api';
import NetworkSettingDialog from '@/components/NetworkSettingDialog.vue';
import RadioButtonSwitch from '@/components/RadioButtonSwitch.vue';
import VolumeSettingDialog from '@/components/VolumeSettingDialog.vue';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import FlavorTableSelection from '@/components/common/FlavorTableSelection.vue';
import OptionCardsDialog from '@/components/common/OptionCardsDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useProjectSwitch from '@/composables/useProjectSwitch';
import useVm from '@/composables/useVm';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import { networkHeaders, volumeHeaders } from '@/constants/VmConstants';
import { type TableItem } from '@/interfaces/InfraDataTableInterface';
import getTableHeaders, { TABLE_TYPE } from '@/utils/getTableHeaders';
import { getFilteredFlavor } from '@/utils/utils';

const { uiShowDialog } = useGlobal();
const { t, router, projectId } = useVm(PAGE_TYPES.VM_CREATE);
const currentStep: Ref<number> = ref(1);
const steps = computed(() => [
  t('creation.step.basic'),
  t('creation.step.flavor'),
  t('creation.step.network'),
  t('creation.step.volume'),
  t('creation.step.auth'),
  t('creation.step.script'),
  t('creation.step.review'),
]);
const { setProjectSwitchCallback } = useProjectSwitch();
const name = ref('vm' + Math.floor(Date.now() / 1000));
const desc = ref('');
const selectedFlavor: Ref<Flavor | undefined> = ref(undefined);
const selectedImage: Ref<Image | undefined> = ref(undefined);
const selectedImageTag: Record<string, any> = ref(undefined);

const selectedVolumes: Ref<Volume[]> = ref([]);
const selectedNetworks: Ref<Network[]> = ref([]);

const enableKeypair = ref(false);
const selectedKeypair: Ref<Keypair> = ref({ name: '', id: '' });

const keypairPassword = ref('');
const initScript = ref('');

const showNetworkDialog = ref(false);
const editingNetwork: Ref<Network | undefined> = ref(undefined);
const editingNetworkIndex = ref(-1);

const showVolumeDialog = ref(false);
const volumeList: Ref<Volume[]> = ref([]);
const networkList: Ref<Network[]> = ref([]);
const sgList: Ref<Network[]> = ref([]);
const volumeTypes = ref([]);

const imageList = ref<{
  public: any[];
  private: any[];
}>({ public: [], private: [] });

const flavorList = ref([]);
const keypairList = ref([]);

const nameInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(null);
const imageTagSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const passwordInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null
);
const keypairInputRef = ref<InstanceType<typeof SelectWithHint> | null>(null);

const validBasic = ref(false);
const formError: Ref<FormError> = ref({});
const checkShowPassword = ref(false);
const isVolumeCreate = ref(false);

const imageTagOptions = computed(() => {
  if (selectedImage.value) {
    return selectedImage.value.tags ?? [];
  }
  return [];
});

const showAlert = computed(() => {
  return Object.values(formError.value).filter(item => !!item).length > 0;
});

const vmFlavorHeaders = computed(() =>
  getTableHeaders(TABLE_TYPE.FLAVOR, [
    {
      title: t('flavor.disk'),
      key: 'disk',
      subTitle: '(GB)',
    },
  ])
);

watch(selectedImage, val => {
  if (val?.tags?.length) {
    selectedImageTag.value = {
      tag: val?.tags[0]?.tag,
      id: val?.tags[0]?.id,
      referenceTarget: val?.tags[0]?.referenceTarget,
      vGPU: val?.tags[0]?.vGPU,
    };
  }
});
onMounted(async () => {
  await fetchData();
  setProjectSwitchCallback(
    async () => await router.push({ name: PAGE_TYPES.VM_LIST })
  );
});

const enum DATA {
  IMAGE_PUBLIC,
  IMAGE_PRIVATE,
  FLAVOR,
  KEYPAIRS,
  VOLUMES,
  NETWORKS,
  SECURITY_GROUPS,
  VOLUME_TYPES,
}

const fetchData = async () => {
  const apiCall = [
    fetchVmImagesPublic,
    fetchVmImagesPrivate,
    fetchVmFlavors,
    fetchVmKeypairs,
    fetchVmVolumes,
    fetchVmNetworks,
    fetchVmSecurityGroups,
    fetchVmVolumeTypes,
  ];

  const apiCallPromises = apiCall.map(item => {
    return makeApiCall({
      apiCallFn: item,
      payload: projectId.value,
    });
  });
  const remapRepo = (imageList: any, isPrivate: boolean = true) => {
    return imageList
      .map((item: any) => ({
        ...item.repository,
        description: item.repository?.description,
        info: isPrivate ? item.repository?.creator?.displayName : '',
        tags: [],
        img: null,
      }))
      .reduce((acc: any, cur: any) => {
        const exists = acc.find((item: { id: any }) => {
          return item.id === cur.id;
        });
        if (!exists) {
          acc = acc.concat(cur);
        }
        return acc;
      }, []);
  };

  const remapTag = (res: any, imageList: any) => {
    return res.forEach((item: any) => {
      const repo = imageList.find(
        (repo: { id: any }) => repo.id === item.repository.id
      );
      repo.tags.push({
        tag: item.name,
        id: item.id,
        referenceTarget: item.referenceTarget,
        vGPU: item.extra?.vgpu ?? undefined,
      });
    });
  };
  await Promise.allSettled(apiCallPromises).then(resFull => {
    resFull.forEach((res: any, index: number) => {
      switch (index) {
        case DATA.IMAGE_PUBLIC:
          imageList.value.public = remapRepo(res.value, false);
          remapTag(res.value, imageList.value.public);
          selectedImage.value = imageList.value.public[0];
          break;
        case DATA.IMAGE_PRIVATE:
          imageList.value.private = remapRepo(res.value);
          remapTag(res.value, imageList.value.private);
          break;
        case DATA.FLAVOR:
          flavorList.value = res.value.map((item: any) => ({
            ...item,
            memory: item?.memory / 1024,
            gpu_count: item?.gpu?.count ?? 0,
          }));
          break;
        case DATA.KEYPAIRS:
          keypairList.value = res.value;
          selectedKeypair.value = keypairList.value[0];
          break;
        case DATA.VOLUMES:
          volumeList.value = res.value;
          break;
        case DATA.NETWORKS:
          networkList.value = res.value;
          break;
        case DATA.SECURITY_GROUPS:
          sgList.value = res.value;
          break;
        case DATA.VOLUME_TYPES:
          volumeTypes.value = res.value;
          break;
      }
    });
  });
};

const errSteps = ref<any[]>([]);
watch(currentStep, val => {
  if (currentStep.value === steps.value.length) {
    errSteps.value = getErrorSteps();
  } else {
    errSteps.value = [];
  }
});

const getErrorSteps = () => {
  const errSteps: any[] = [];
  if (currentStep.value !== steps.value.length) {
    return errSteps;
  }
  // basic
  nameInputRef.value?.validate();
  imageTagSelectRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }

  // flavor
  if (!selectedFlavor.value) {
    errSteps.push(steps.value[1]);
  }

  // network
  if (selectedNetworks.value.length === 0) {
    errSteps.push(steps.value[2]);
  }

  // keypair
  passwordInputRef.value?.validate();
  keypairInputRef.value?.validate();
  if (
    formError.value.keypair ||
    formError.value.password ||
    !keypairPassword.value ||
    (!selectedKeypair.value && enableKeypair.value)
  ) {
    errSteps.push(steps.value[4]);
  }
  return errSteps;
};

const updateImage = (image: any) => {
  selectedImage.value = image;
};

const addNewNetwork = (networkItem: Network) => {
  selectedNetworks.value.push(networkItem);
  closeNetworkDialog();
};
const updateNetwork = ({
  networkItem,
  index,
}: {
  networkItem: Network;
  index: number;
}) => {
  selectedNetworks.value[index] = networkItem;
  closeNetworkDialog();
};
const closeNetworkDialog = () => {
  showNetworkDialog.value = false;
  editingNetwork.value = undefined;
  editingNetworkIndex.value = -1;
};

const updateVolume = (volumeItems: Volume[]) => {
  selectedVolumes.value = selectedVolumes.value.concat(volumeItems);
};

const submit = async () => {
  const vmItem: Record<string, any> = {
    name: name.value,
    description: desc.value,
    image_id: selectedImageTag.value.id,
    flavor_id: selectedFlavor.value?.id ?? '',
    nics: selectedNetworks.value.map(item => ({
      network_id: item.id,
      sg_ids: item.security_groups?.id ?? [],
    })),
    volumes: selectedVolumes.value.map(item => ({
      volume_id: item.id || null,
      name: item.name,
      size: Number(item.size),
      type: item.type,
    })),
    password: Buffer.from(keypairPassword.value).toString('base64'),
  };
  if (enableKeypair.value) {
    vmItem.keypair_id = selectedKeypair.value.id;
  }
  if (initScript.value) {
    vmItem.boot_script = Buffer.from(initScript.value).toString('base64');
  }

  await makeApiCall({
    apiCallFn: createVm,
    payload: {
      projectId: projectId.value,
      vmItem,
    },
    successCallback: async () =>
      await router.push({ name: PAGE_TYPES.VM_LIST }),
  });
};
const cancel = () => {
  void router.push({ name: PAGE_TYPES.VM_LIST });
};

const filteredFlavorList = computed(() => {
  const vGPU: string = selectedImageTag.value?.vGPU;
  return getFilteredFlavor(flavorList.value, vGPU);
});

watch(
  () => filteredFlavorList.value,
  () => {
    selectedFlavor.value = filteredFlavorList.value[0];
  }
);
const fileInputRef = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const maxSize = 100 * 1024; // 100 KB
  const input = event.target as HTMLInputElement;

  if (!input?.files || input.files.length === 0) {
    return; // Exit if there’s no file
  }
  const file = input.files[0];
  if (file.size > maxSize) {
    uiShowDialog({
      title: '',
      message: t('vm.scriptImport.fileExceedSize'),
      hideCancelBtn: true,
    });
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    initScript.value = e.target?.result as string;
    input.value = '';
  };
  reader.readAsText(file);
};

const networkListFiltered = computed(() => {
  return networkList.value.filter(
    network => !selectedNetworks.value.some(item => item.id === network.id)
  );
});
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="ocis-main-content create-view-content">
      <TitleComp
        :title="
          $t('basic.create.type', { type: $t('services.virtualMachine') })
        "
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <v-row no-gutters>
                <v-col cols="12">
                  <TextFieldWithHint
                    ref="nameInputRef"
                    v-model="name"
                    :title="$t('label.name')"
                    required
                    :text-field-col="6"
                    :type="'name'"
                    @form-error="
                      event => {
                        formError.name = event[0];
                      }
                    "
                  />
                </v-col>
                <v-col cols="12">
                  <TextFieldWithHint
                    v-model="desc"
                    :title="$t('basic.desc')"
                    :text-field-col="6"
                  />
                </v-col>
                <v-col cols="12">
                  <OptionCardsDialog
                    :display-items="imageList"
                    :selected="selectedImage?.name"
                    :display-tabs="{
                      public: $t('basic.public'),
                      private: $t('basic.private'),
                    }"
                    :dialog-title="$t('image.source')"
                    :title="$t('image.source')"
                    @update="updateImage"
                  />
                </v-col>
                <v-col cols="12">
                  <SelectWithHint
                    ref="imageTagSelectRef"
                    v-model="selectedImageTag"
                    :title="$t('image.tag')"
                    :items="imageTagOptions"
                    :item-text="'tag'"
                    return-object
                    :selection-cols="6"
                    required
                    @form-error="
                      event => {
                        if (event) formError.imageTag = event;
                      }
                    "
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <FlavorTableSelection
              v-model="selectedFlavor"
              :headers="vmFlavorHeaders"
              :items="filteredFlavorList"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="3">
            <div class="pb-4">
              <v-row no-gutters>
                <!-- <v-col cols="12">
                  <span>{{ $t('creation.network.hint') }}</span>
                </v-col> -->
                <v-col cols="12">
                  <OutlinedBtn
                    :text="$t('vm.network.add')"
                    @click="showNetworkDialog = true"
                  />
                </v-col>
              </v-row>
            </div>
            <DetailTable
              :items="selectedNetworks"
              :headers="networkHeaders"
              :actions="[
                {
                  label: t('table.action.edit'),
                  action: (item: TableItem, index: number) => {
                    editingNetwork = item as Network;
                    editingNetworkIndex = index;
                    showNetworkDialog = true;
                  },
                },
                {
                  label: t('table.action.delete'),
                  action: (item: TableItem, index: number) => {
                    selectedNetworks.splice(index, 1);
                  },
                },
              ]"
            />

            <div
              v-if="selectedNetworks.length === 0"
              class="ocis-text-alert pt-2"
            >
              {{ `* ${$t('vm.network.alert')}` }}
            </div>
            <NetworkSettingDialog
              v-model:show="showNetworkDialog"
              :editing-network="editingNetwork"
              :editing-index="editingNetworkIndex"
              :network-options="networkListFiltered"
              :security-group-options="sgList"
              @add-new-network="addNewNetwork"
              @update-network="updateNetwork"
              @close-dialog="closeNetworkDialog"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="4">
            <div class="pb-4">
              <v-row no-gutters>
                <v-col cols="12">
                  <span>
                    {{ $t('creation.volume.hint') }}
                  </span>
                </v-col>
                <v-col cols="12" class="pt-4">
                  <OutlinedBtn
                    :text="$t('vm.volume.add.new')"
                    @click="
                      () => {
                        showVolumeDialog = true;
                        isVolumeCreate = true;
                      }
                    "
                  />
                  <OutlinedBtn
                    class="ml-2"
                    :text="$t('vm.volume.add')"
                    @click="
                      () => {
                        showVolumeDialog = true;
                        isVolumeCreate = false;
                      }
                    "
                  />
                </v-col>
              </v-row>
            </div>
            <DetailTable
              v-if="selectedVolumes.length > 0"
              :items="selectedVolumes"
              :headers="volumeHeaders"
              :actions="[
                {
                  label: $t('table.action.delete'),
                  action: (item: TableItem, index: number) => {
                    selectedVolumes.splice(index, 1);
                  },
                },
              ]"
            />
            <VolumeSettingDialog
              v-model:show="showVolumeDialog"
              :title="
                isVolumeCreate ? $t('vm.volume.add.new') : $t('vm.volume.add')
              "
              :is-create="isVolumeCreate"
              :volume-types="volumeTypes"
              :volume-list="
                volumeList.filter(
                  volume =>
                    volume.status?.toLowerCase() === 'available' &&
                    !selectedVolumes.some(item => item.id === volume.id)
                )
              "
              @update-volume="updateVolume"
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="5" eager>
            <RadioButtonSwitch
              :title="$t('creation.keypair.auth')"
              :init-value="enableKeypair"
              :options="[
                {
                  label: $t('basic.enabled'),
                  value: true,
                },
                {
                  label: $t('basic.disabled'),
                  value: false,
                },
              ]"
              @selected="
                value => {
                  enableKeypair = value;
                  if (!value) {
                    formError.keypair = '';
                  }
                }
              "
            />
            <SelectWithHint
              v-if="enableKeypair"
              ref="keypairInputRef"
              v-model="selectedKeypair"
              :title="$t('services.keypairs')"
              :items="keypairList"
              :item-text="'name'"
              :item-value="'name'"
              return-object
              :selection-cols="6"
              required
              @form-error="
                event => {
                  if (event) formError.keypair = event;
                }
              "
            />
            <TextFieldWithHint
              ref="passwordInputRef"
              v-model="keypairPassword"
              :title="$t('basic.password')"
              type="password"
              :text-field-col="6"
              required
              @form-error="
                event => {
                  formError.password = event[0];
                }
              "
            />
          </v-stepper-window-item>
          <v-stepper-window-item :value="6">
            <v-row>
              <v-col cols="12">
                <span>{{ $t('label.initialization.script') }}</span>
              </v-col>
              <v-col cols="12">
                <TextareaComponent v-model="initScript" :rows="5" auto-grow />
              </v-col>
              <v-col cols="3">
                <OutlinedBtn
                  :text="$t('basic.import')"
                  @click="triggerFileInput"
                />
                <input
                  ref="fileInputRef"
                  class="d-none"
                  type="file"
                  @change="handleFileChange"
                />
              </v-col>
            </v-row>
          </v-stepper-window-item>
          <v-stepper-window-item :value="7">
            <v-row>
              <v-col v-if="showAlert" class="pa-0" cols="12">
                <AlertComponent :message="$t('form.error.alert')" />
              </v-col>

              <CheckItem
                :key-name="$t('label.name')"
                :value="name"
                :error-msg="formError.name"
              />

              <CheckItem :key-name="$t('basic.desc')" :value="desc" />
              <CheckItem
                :key-name="$t('image.source')"
                :value="selectedImage?.name"
              />
              <CheckItem
                :key-name="$t('image.tag')"
                :error-msg="formError.imageTag"
                :value="selectedImageTag?.tag"
              />
              <CheckItem
                :key-name="$t('creation.step.flavor')"
                :error-msg="selectedFlavor?.name ? '' : $t('form.required')"
                :value="selectedFlavor?.name"
              />
              <CheckItem :key-name="$t('services.virtualNetwork')">
                <v-col cols="9">
                  <DetailTable
                    :items="selectedNetworks"
                    :headers="networkHeaders"
                    required
                  />
                </v-col>
              </CheckItem>
              <CheckItem :key-name="$t('services.virtualVolume')">
                <v-col cols="9">
                  <DetailTable
                    :items="selectedVolumes"
                    :headers="volumeHeaders"
                  />
                </v-col>
              </CheckItem>
              <CheckItem
                :key-name="$t('services.keypairs')"
                :value="
                  enableKeypair ? selectedKeypair?.name : $t('basic.close')
                "
                :error-msg="formError.keypair"
              />
              <CheckItem
                :key-name="$t('basic.password')"
                :error-msg="formError.password"
                :password="!!keypairPassword"
              >
                <v-col v-if="keypairPassword" cols="9">
                  <v-text-field
                    :model-value="keypairPassword"
                    :append-icon="checkShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="checkShowPassword ? 'text' : 'password'"
                    variant="plain"
                    readonly
                    :width="`${keypairPassword.length + 2}rem`"
                    hide-details
                    @click:append="checkShowPassword = !checkShowPassword"
                  />
                </v-col>
              </CheckItem>
              <CheckItem
                :key-name="$t('creation.step.script')"
                :value="initScript"
                is-text-area
              />
            </v-row>
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<style lang="scss" scoped></style>
