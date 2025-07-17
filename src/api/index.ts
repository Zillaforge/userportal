export * from './apiCallFunctions';

// IAM Api Swagger
// http://10.78.26.44:30000/aes/pegasusiam/-/blob/master/swagger.yaml
export * from './userApis';
export * from './projectApis';
export * from './mfaApis';

export * from './logsApis';

export * from './s3StorageApis';

// Container Image Api Swagger
// http://10.78.26.44:30000/aes/containerregistrymanagement/-/blob/master/swagger.yaml
export * from './containerImageApis';

// Virtual Image Api Swagger
// http://10.78.26.44:30000/aes/virtualregistrymanagement/-/blob/master/swagger.yaml
export * from './virtualImageApis';

// K8s Api Swagger
// http://10.78.26.44:30000/aes/trustcloudkaas/-/blob/master/swagger.yaml
// http://10.78.26.44:30000/aes/cloudkubeservice/-/blob/master/swagger.yaml
export * from './k8sClusterApis';

// Vm Api Swagger
// http://10.78.26.44:30000/aes/virtualplatformservice/-/blob/main/docs/swagger.yaml
export * from './vmApis';

// HPC Remote Dispatch
// http://10.78.26.44:30000/aes/remotedispatchservice/-/blob/master/swagger.yaml
export * from './remoteDispatchApis';

// File Sharing (share)
// http://10.78.26.44:30000/aes/virtualplatformservice/-/blob/main/docs/swagger.yaml
export * from './fileSharingApis';

// Resource Transfer (Resource Shift Service)
// http://10.78.26.44:30000/aes/ResourceShiftService/-/blob/master/swagger.yaml
export * from './resourceTransferApis';

// Application
// http://10.78.26.44:30000/aes/appplaygroundservice/-/blob/master/swagger.yaml
export * from './applicationApis';
