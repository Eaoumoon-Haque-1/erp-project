/**
 * @file Route registry for Inventory.
 * Sections: Item Category CRUD routes.
 */
import ItemCategoryCreate from './item-category/pages/ItemCategoryCreate'
import ItemCategoryEdit from './item-category/pages/ItemCategoryEdit'
import ItemCategoryList from './item-category/pages/ItemCategoryList'
import ItemCategoryView from './item-category/pages/ItemCategoryView'
import ItemBrandCreate from './item-brand/pages/ItemBrandCreate'
import ItemBrandEdit from './item-brand/pages/ItemBrandEdit'
import ItemBrandList from './item-brand/pages/ItemBrandList'
import ItemBrandView from './item-brand/pages/ItemBrandView'
import ItemStoreCreate from './item-store/pages/ItemStoreCreate'
import ItemStoreEdit from './item-store/pages/ItemStoreEdit'
import ItemStoreList from './item-store/pages/ItemStoreList'
import ItemStoreView from './item-store/pages/ItemStoreView'
import ItemWarehouseCreate from './item-warehouse/pages/ItemWarehouseCreate'
import ItemWarehouseEdit from './item-warehouse/pages/ItemWarehouseEdit'
import ItemWarehouseList from './item-warehouse/pages/ItemWarehouseList'
import ItemWarehouseView from './item-warehouse/pages/ItemWarehouseView'
import ItemAttributeCreate from './item-attribute/pages/ItemAttributeCreate'
import ItemAttributeEdit from './item-attribute/pages/ItemAttributeEdit'
import ItemAttributeList from './item-attribute/pages/ItemAttributeList'
import ItemAttributeView from './item-attribute/pages/ItemAttributeView'
import ItemCreate from './item/pages/ItemCreate'
import ItemEdit from './item/pages/ItemEdit'
import ItemList from './item/pages/ItemList'
import ItemView from './item/pages/ItemView'

export const inventoryRoutes = [
  {
    path: 'inventory/item-category',
    element: <ItemCategoryList />,
  },
  {
    path: 'inventory/item-category/create',
    element: <ItemCategoryCreate />,
  },
  {
    path: 'inventory/item-category/:categoryId/edit',
    element: <ItemCategoryEdit />,
  },
  {
    path: 'inventory/item-category/:categoryId/view',
    element: <ItemCategoryView />,
  },
  {
    path: 'inventory/item-brand',
    element: <ItemBrandList />,
  },
  {
    path: 'inventory/item-brand/create',
    element: <ItemBrandCreate />,
  },
  {
    path: 'inventory/item-brand/:brandId/edit',
    element: <ItemBrandEdit />,
  },
  {
    path: 'inventory/item-brand/:brandId/view',
    element: <ItemBrandView />,
  },
  {
    path: 'inventory/item-store',
    element: <ItemStoreList />,
  },
  {
    path: 'inventory/item-store/create',
    element: <ItemStoreCreate />,
  },
  {
    path: 'inventory/item-store/:storeId/edit',
    element: <ItemStoreEdit />,
  },
  {
    path: 'inventory/item-store/:storeId/view',
    element: <ItemStoreView />,
  },
  {
    path: 'inventory/item-warehouse',
    element: <ItemWarehouseList />,
  },
  {
    path: 'inventory/item-warehouse/create',
    element: <ItemWarehouseCreate />,
  },
  {
    path: 'inventory/item-warehouse/:warehouseId/edit',
    element: <ItemWarehouseEdit />,
  },
  {
    path: 'inventory/item-warehouse/:warehouseId/view',
    element: <ItemWarehouseView />,
  },
  {
    path: 'inventory/item-attribute',
    element: <ItemAttributeList />,
  },
  {
    path: 'inventory/item-attribute/create',
    element: <ItemAttributeCreate />,
  },
  {
    path: 'inventory/item-attribute/:attributeId/edit',
    element: <ItemAttributeEdit />,
  },
  {
    path: 'inventory/item-attribute/:attributeId/view',
    element: <ItemAttributeView />,
  },
  {
    path: 'inventory/item',
    element: <ItemList />,
  },
  {
    path: 'inventory/item/create',
    element: <ItemCreate />,
  },
  {
    path: 'inventory/item/:itemId/edit',
    element: <ItemEdit />,
  },
  {
    path: 'inventory/item/:itemId/view',
    element: <ItemView />,
  },
]

