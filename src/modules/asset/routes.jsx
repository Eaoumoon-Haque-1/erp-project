/** @file Route registry for the Asset module. Keep paths synchronized with menu.js. */
import AssetGroupCreate from './asset-group/pages/AssetGroupCreate'
import AssetGroupEdit from './asset-group/pages/AssetGroupEdit'
import AssetGroupList from './asset-group/pages/AssetGroupList'
import AssetAssignEmployeeCreate from './asset-assign-employee/pages/AssetAssignEmployeeCreate'
import AssetAssignEmployeeEdit from './asset-assign-employee/pages/AssetAssignEmployeeEdit'
import AssetAssignEmployeeList from './asset-assign-employee/pages/AssetAssignEmployeeList'
import AssetDisposalCreate from './asset-disposal-retirement/pages/AssetDisposalCreate'
import AssetDisposalEdit from './asset-disposal-retirement/pages/AssetDisposalEdit'
import AssetDisposalList from './asset-disposal-retirement/pages/AssetDisposalList'
import AssetReturnEmployeeCreate from './asset-return-employee/pages/AssetReturnEmployeeCreate'
import AssetReturnEmployeeEdit from './asset-return-employee/pages/AssetReturnEmployeeEdit'
import AssetReturnEmployeeList from './asset-return-employee/pages/AssetReturnEmployeeList'
import AssetRepairCreate from './asset-repair/pages/AssetRepairCreate'
import AssetRepairEdit from './asset-repair/pages/AssetRepairEdit'
import AssetRepairList from './asset-repair/pages/AssetRepairList'
import AssetTransferCreate from './asset-transfer/pages/AssetTransferCreate'
import AssetTransferEdit from './asset-transfer/pages/AssetTransferEdit'
import AssetTransferList from './asset-transfer/pages/AssetTransferList'
import AssetItemInformationCreate from './asset-item-information/pages/AssetItemInformationCreate'
import AssetItemInformationEdit from './asset-item-information/pages/AssetItemInformationEdit'
import AssetItemInformationList from './asset-item-information/pages/AssetItemInformationList'
import AssetReceiveRegisterCreate from './asset-receive-register/pages/AssetReceiveRegisterCreate'
import AssetReceiveRegisterEdit from './asset-receive-register/pages/AssetReceiveRegisterEdit'
import AssetReceiveRegisterList from './asset-receive-register/pages/AssetReceiveRegisterList'
import AssetLookupTypeCreate from './asset-lookup-type/pages/AssetLookupTypeCreate'
import AssetLookupTypeEdit from './asset-lookup-type/pages/AssetLookupTypeEdit'
import AssetLookupTypeList from './asset-lookup-type/pages/AssetLookupTypeList'
import AssetLookupValueCreate from './asset-lookup-value/pages/AssetLookupValueCreate'
import AssetLookupValueEdit from './asset-lookup-value/pages/AssetLookupValueEdit'
import AssetLookupValueList from './asset-lookup-value/pages/AssetLookupValueList'
import AssetSpecificationMapCreate from './asset-specification-map/pages/AssetSpecificationMapCreate'
import AssetSpecificationMapEdit from './asset-specification-map/pages/AssetSpecificationMapEdit'
import AssetSpecificationMapList from './asset-specification-map/pages/AssetSpecificationMapList'
import BulkAssetReceiveForSplitCreate from './bulk-asset-receive-for-split/pages/BulkAssetReceiveForSplitCreate'
import BulkAssetReceiveForSplitEdit from './bulk-asset-receive-for-split/pages/BulkAssetReceiveForSplitEdit'
import BulkAssetReceiveForSplitList from './bulk-asset-receive-for-split/pages/BulkAssetReceiveForSplitList'
import CustodianCreate from './custodian/pages/CustodianCreate'
import CustodianEdit from './custodian/pages/CustodianEdit'
import CustodianList from './custodian/pages/CustodianList'
import DepreciationCategoryCreate from './depreciation-category/pages/DepreciationCategoryCreate'
import DepreciationCategoryEdit from './depreciation-category/pages/DepreciationCategoryEdit'
import DepreciationCategoryList from './depreciation-category/pages/DepreciationCategoryList'
import LocationMasterCreate from './location-master/pages/LocationMasterCreate'
import LocationMasterEdit from './location-master/pages/LocationMasterEdit'
import LocationMasterList from './location-master/pages/LocationMasterList'
import MaintenanceAmcCreate from './maintenance-amc/pages/MaintenanceAmcCreate'
import MaintenanceAmcEdit from './maintenance-amc/pages/MaintenanceAmcEdit'
import MaintenanceAmcList from './maintenance-amc/pages/MaintenanceAmcList'
import VendorSupplierMasterCreate from './vendor-supplier-master/pages/VendorSupplierMasterCreate'
import VendorSupplierMasterEdit from './vendor-supplier-master/pages/VendorSupplierMasterEdit'
import VendorSupplierMasterList from './vendor-supplier-master/pages/VendorSupplierMasterList'

export const assetRoutes = [
  { path: 'asset/asset-assign-to-employee', element: <AssetAssignEmployeeList /> },
  { path: 'asset/asset-assign-to-employee/create', element: <AssetAssignEmployeeCreate /> },
  { path: 'asset/asset-assign-to-employee/:assetAssignmentId/edit', element: <AssetAssignEmployeeEdit /> },
  { path: 'asset/asset-return-from-employee', element: <AssetReturnEmployeeList /> },
  { path: 'asset/asset-return-from-employee/create', element: <AssetReturnEmployeeCreate /> },
  { path: 'asset/asset-return-from-employee/:assetReturnId/edit', element: <AssetReturnEmployeeEdit /> },
  { path: 'asset/asset-transfer', element: <AssetTransferList /> },
  { path: 'asset/asset-transfer/create', element: <AssetTransferCreate /> },
  { path: 'asset/asset-transfer/:assetTransferId/edit', element: <AssetTransferEdit /> },
  { path: 'asset/maintenance-amc', element: <MaintenanceAmcList /> },
  { path: 'asset/maintenance-amc/create', element: <MaintenanceAmcCreate /> },
  { path: 'asset/maintenance-amc/:maintenanceId/edit', element: <MaintenanceAmcEdit /> },
  { path: 'asset/asset-disposal-retirement', element: <AssetDisposalList /> },
  { path: 'asset/asset-disposal-retirement/create', element: <AssetDisposalCreate /> },
  { path: 'asset/asset-disposal-retirement/:disposalId/edit', element: <AssetDisposalEdit /> },
  { path: 'asset/asset-repair', element: <AssetRepairList /> },
  { path: 'asset/asset-repair/create', element: <AssetRepairCreate /> },
  { path: 'asset/asset-repair/:repairId/edit', element: <AssetRepairEdit /> },
  { path: 'asset/asset-group', element: <AssetGroupList /> },
  { path: 'asset/asset-group/create', element: <AssetGroupCreate /> },
  { path: 'asset/asset-group/:assetGroupId/edit', element: <AssetGroupEdit /> },
  { path: 'asset/asset-item-information', element: <AssetItemInformationList /> },
  { path: 'asset/asset-item-information/create', element: <AssetItemInformationCreate /> },
  { path: 'asset/asset-item-information/:assetItemId/edit', element: <AssetItemInformationEdit /> },
  { path: 'asset/asset-receive-register', element: <AssetReceiveRegisterList /> },
  { path: 'asset/asset-receive-register/create', element: <AssetReceiveRegisterCreate /> },
  { path: 'asset/asset-receive-register/:assetReceiveId/edit', element: <AssetReceiveRegisterEdit /> },
  { path: 'asset/bulk-asset-receive-for-split', element: <BulkAssetReceiveForSplitList /> },
  { path: 'asset/bulk-asset-receive-for-split/create', element: <BulkAssetReceiveForSplitCreate /> },
  { path: 'asset/bulk-asset-receive-for-split/:bulkAssetReceiveId/edit', element: <BulkAssetReceiveForSplitEdit /> },
  { path: 'asset/asset-specification-map', element: <AssetSpecificationMapList /> },
  { path: 'asset/asset-specification-map/create', element: <AssetSpecificationMapCreate /> },
  { path: 'asset/asset-specification-map/:assetSpecificationMapId/edit', element: <AssetSpecificationMapEdit /> },
  { path: 'asset/custodian', element: <CustodianList /> },
  { path: 'asset/custodian/create', element: <CustodianCreate /> },
  { path: 'asset/custodian/:custodianId/edit', element: <CustodianEdit /> },
  { path: 'asset/location-master', element: <LocationMasterList /> },
  { path: 'asset/location-master/create', element: <LocationMasterCreate /> },
  { path: 'asset/location-master/:locationMasterId/edit', element: <LocationMasterEdit /> },
  { path: 'asset/vendor-supplier-master', element: <VendorSupplierMasterList /> },
  { path: 'asset/vendor-supplier-master/create', element: <VendorSupplierMasterCreate /> },
  { path: 'asset/vendor-supplier-master/:vendorSupplierId/edit', element: <VendorSupplierMasterEdit /> },
  { path: 'asset/asset-lookup-type', element: <AssetLookupTypeList /> },
  { path: 'asset/asset-lookup-type/create', element: <AssetLookupTypeCreate /> },
  { path: 'asset/asset-lookup-type/:assetLookupTypeId/edit', element: <AssetLookupTypeEdit /> },
  { path: 'asset/asset-lookup-value', element: <AssetLookupValueList /> },
  { path: 'asset/asset-lookup-value/create', element: <AssetLookupValueCreate /> },
  { path: 'asset/asset-lookup-value/:assetLookupValueId/edit', element: <AssetLookupValueEdit /> },
  { path: 'asset/depreciation-category', element: <DepreciationCategoryList /> },
  { path: 'asset/depreciation-category/create', element: <DepreciationCategoryCreate /> },
  { path: 'asset/depreciation-category/:depreciationCategoryId/edit', element: <DepreciationCategoryEdit /> },
]

