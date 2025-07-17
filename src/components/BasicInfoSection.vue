<template>
  <v-row no-gutters>
    <v-col cols="12" md="3" class="text-center">
      <v-card class="myCard-bg">
        <div class="service-title text-left">
          <div class="pt-1 pl-2">{{ '身份' }}</div>
          <v-divider />
        </div>
        <div
          class="account-icon text-center bg-grey-lighten-3 d-inline-block mt-4"
        >
          <v-icon class="fill-height" size="48">mdi-account</v-icon>
        </div>
        <div class="text-center mt-4">
          {{ '王小明' }}
        </div>
        <div class="text-center role-text pb-4">
          {{ true ? $t('label.tenantAdmin') : $t('label.tenantUser') }}
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="9" class="">
      <v-card class="myCard-bg fill-height ml-md-4 mt-4 mt-md-0">
        <div class="pt-1 service-title text-left pl-2">
          {{ $t('label.projectInfo') }}
        </div>
        <v-divider />
        <div class="pa-4">
          {{ 'ID: 999999' }}
          <br />
          {{ `${$t('label.projectName')}: 測試計畫` }}
          <br />
          {{ `${$t('label.createdAt')}: 2023-05-25 08:00` }}
          <br />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.account-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: rgb(var(--v-theme-primary)) !important;
}
.account-info {
  background-color: rgb(var(--v-theme-bg-default)) !important;
}
.project-title {
  display: block;
  font-weight: bold;
  background-color: rgb(var(--v-theme-bg-highlight));
}

.role-text {
  color: rgb(var(--v-theme-primary)) !important;
}

.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}
</style>
