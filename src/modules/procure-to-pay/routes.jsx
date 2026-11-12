/**
 * @file Route registry for Procure to Pay.
 * Supplier data is still shared with Asset workflows through the existing
 * repository until the INV_SUPPLIER API is available.
 */
import VendorSupplierMasterCreate from '../asset/vendor-supplier-master/pages/VendorSupplierMasterCreate'
import VendorSupplierMasterEdit from '../asset/vendor-supplier-master/pages/VendorSupplierMasterEdit'
import VendorSupplierMasterList from '../asset/vendor-supplier-master/pages/VendorSupplierMasterList'
import AssetUnitOfMeasureCreate from './asset-unit-of-measure/pages/AssetUnitOfMeasureCreate'
import AssetUnitOfMeasureEdit from './asset-unit-of-measure/pages/AssetUnitOfMeasureEdit'
import AssetUnitOfMeasureList from './asset-unit-of-measure/pages/AssetUnitOfMeasureList'
import AssetUnitOfMeasureView from './asset-unit-of-measure/pages/AssetUnitOfMeasureView'
import ItemCategoryCreate from '../inventory/item-category/pages/ItemCategoryCreate'
import ItemCategoryEdit from '../inventory/item-category/pages/ItemCategoryEdit'
import ItemCategoryList from '../inventory/item-category/pages/ItemCategoryList'
import ItemCategoryView from '../inventory/item-category/pages/ItemCategoryView'
import ItemBrandCreate from '../inventory/item-brand/pages/ItemBrandCreate'
import ItemBrandEdit from '../inventory/item-brand/pages/ItemBrandEdit'
import ItemBrandList from '../inventory/item-brand/pages/ItemBrandList'
import ItemBrandView from '../inventory/item-brand/pages/ItemBrandView'
import ItemStoreCreate from '../inventory/item-store/pages/ItemStoreCreate'
import ItemStoreEdit from '../inventory/item-store/pages/ItemStoreEdit'
import ItemStoreList from '../inventory/item-store/pages/ItemStoreList'
import ItemStoreView from '../inventory/item-store/pages/ItemStoreView'
import ItemWarehouseCreate from '../inventory/item-warehouse/pages/ItemWarehouseCreate'
import ItemWarehouseEdit from '../inventory/item-warehouse/pages/ItemWarehouseEdit'
import ItemWarehouseList from '../inventory/item-warehouse/pages/ItemWarehouseList'
import ItemWarehouseView from '../inventory/item-warehouse/pages/ItemWarehouseView'
import ItemAttributeCreate from '../inventory/item-attribute/pages/ItemAttributeCreate'
import ItemAttributeEdit from '../inventory/item-attribute/pages/ItemAttributeEdit'
import ItemAttributeList from '../inventory/item-attribute/pages/ItemAttributeList'
import ItemAttributeView from '../inventory/item-attribute/pages/ItemAttributeView'
import ItemCreate from '../inventory/item/pages/ItemCreate'
import ItemEdit from '../inventory/item/pages/ItemEdit'
import ItemList from '../inventory/item/pages/ItemList'
import ItemView from '../inventory/item/pages/ItemView'

export const procureToPayRoutes = [
  {
    path: 'procure-to-pay/procurement-settings/item-category',
    element: <ItemCategoryList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-category/create',
    element: <ItemCategoryCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-category/:categoryId/view',
    element: <ItemCategoryView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-category/:categoryId/edit',
    element: <ItemCategoryEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-brand',
    element: <ItemBrandList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-brand/create',
    element: <ItemBrandCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-brand/:brandId/view',
    element: <ItemBrandView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-brand/:brandId/edit',
    element: <ItemBrandEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-store',
    element: <ItemStoreList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-store/create',
    element: <ItemStoreCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-store/:storeId/view',
    element: <ItemStoreView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-store/:storeId/edit',
    element: <ItemStoreEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-warehouse',
    element: <ItemWarehouseList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-warehouse/create',
    element: <ItemWarehouseCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-warehouse/:warehouseId/view',
    element: <ItemWarehouseView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-warehouse/:warehouseId/edit',
    element: <ItemWarehouseEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-attribute',
    element: <ItemAttributeList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-attribute/create',
    element: <ItemAttributeCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-attribute/:attributeId/view',
    element: <ItemAttributeView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item-attribute/:attributeId/edit',
    element: <ItemAttributeEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item',
    element: <ItemList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item/create',
    element: <ItemCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item/:itemId/view',
    element: <ItemView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/item/:itemId/edit',
    element: <ItemEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/supplier-information',
    element: <VendorSupplierMasterList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/supplier-information/create',
    element: <VendorSupplierMasterCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/supplier-information/:vendorSupplierId/edit',
    element: <VendorSupplierMasterEdit />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure',
    element: <AssetUnitOfMeasureList />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure/create',
    element: <AssetUnitOfMeasureCreate />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure/:assetUnitOfMeasureId/view',
    element: <AssetUnitOfMeasureView />,
  },
  {
    path: 'procure-to-pay/procurement-settings/asset-unit-of-measure/:assetUnitOfMeasureId/edit',
    element: <AssetUnitOfMeasureEdit />,
  },
]
