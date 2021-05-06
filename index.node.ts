import { BoundingBox } from './lib/boundingBox';
import { ClosestFeature, GeoPackage } from './lib/geoPackage';
import { ContentsDao } from './lib/core/contents/contentsDao';
import { ContentsIdDao } from './lib/extension/contents/contentsIdDao';
import { Constraint } from './lib/db/table/constraint';
import { Constraints } from './lib/db/table/constraints';
import { CrsWktExtension } from './lib/extension/crsWkt';
import { DataColumnConstraints } from './lib/dataColumnConstraints/dataColumnConstraints';
import { DataColumnConstraintsDao } from './lib/dataColumnConstraints/dataColumnConstraintsDao';
import { DataColumns } from './lib/dataColumns/dataColumns';
import { GeoPackageDataType } from './lib/db/geoPackageDataType';
import { DataColumnsDao } from './lib/dataColumns/dataColumnsDao';
import { DublinCoreMetadata } from './lib/extension/relatedTables/dublinCoreMetadata';
import { DublinCoreType } from './lib/extension/relatedTables/dublinCoreType';
import { Extension } from './lib/extension/extension';
import { FeatureColumn } from './lib/features/user/featureColumn';
import { FeatureDrawType } from './lib/tiles/features/featureDrawType';
import { FeaturePaint } from './lib/tiles/features/featurePaint';
import { FeatureStyle } from './lib/extension/style/featureStyle';
import { FeatureStyleExtension } from './lib/extension/style';
import { FeatureStyles } from './lib/extension/style/featureStyles';
import { FeatureTable } from './lib/features/user/featureTable';
import { FeatureTableIndex } from './lib/extension/index/featureTableIndex';
import { FeatureTableReader } from './lib/features/user/featureTableReader';
import { FeatureTableStyles } from './lib/extension/style/featureTableStyles';
import { FeatureTiles } from './lib/tiles/features';
import { GeometryColumns } from './lib/features/columns/geometryColumns';
import { GeometryColumnsDao } from './lib/features/columns/geometryColumnsDao';
import { GeometryData } from './lib/geom/geometryData';
import { GeometryType } from './lib/features/user/geometryType';
import { GeoPackageAPI } from './lib/api';
import { GeoPackageConnection } from './lib/db/geoPackageConnection';
import { GeoPackageTileRetriever } from './lib/tiles/retriever';
import { GeoPackageValidate } from './lib/validate/geoPackageValidate';
import { IconCache } from './lib/extension/style/iconCache';
import { Icons } from './lib/extension/style/icons';
import { IconTable } from './lib/extension/style/iconTable';
import { ImageUtils } from './lib/tiles/imageUtils';
import { MediaTable } from './lib/extension/relatedTables/mediaTable';
import { Metadata } from './lib/metadata/metadata';
import { MetadataDao } from './lib/metadata/metadataDao';
import { MetadataExtension } from './lib/extension/metadata';
import { MetadataReference } from './lib/metadata/reference/metadataReference';
import { NumberFeaturesTile } from './lib/tiles/features/custom/numberFeaturesTile';
import { OptionBuilder } from './lib/optionBuilder';
import { Paint } from './lib/tiles/features/paint';
import { RelatedTablesExtension } from './lib/extension/relatedTables';
import { RTreeIndex } from './lib/extension/rtree/rtreeIndex';
import { RTreeIndexDao } from './lib/extension/rtree/rtreeIndexDao';
import { SchemaExtension } from './lib/extension/schema';
import { ShadedFeaturesTile } from './lib/tiles/features/custom/shadedFeaturesTile';
import { SimpleAttributesTable } from './lib/extension/relatedTables/simpleAttributesTable';
import { SpatialReferenceSystem } from './lib/core/srs/spatialReferenceSystem';
import { SqliteQueryBuilder } from './lib/db/sqliteQueryBuilder';
import { StyleMappingTable } from './lib/extension/style/styleMappingTable';
import { Styles } from './lib/extension/style/styles';
import { StyleTable } from './lib/extension/style/styleTable';
import { TableCreator } from './lib/db/tableCreator';
import { TileBoundingBoxUtils } from './lib/tiles/tileBoundingBoxUtils';
import { TileColumn } from './lib/tiles/user/tileColumn';
import { TileMatrix } from './lib/tiles/matrix/tileMatrix';
import { TileMatrixSet } from './lib/tiles/matrixset/tileMatrixSet';
import { TileScaling } from './lib/extension/scale/tileScaling';
import { TileScalingType } from './lib/extension/scale/tileScalingType';
import { TileTable } from './lib/tiles/user/tileTable';
import { UserColumn } from './lib/user/userColumn';
import { UserDao } from './lib/user/userDao';
import { UserMappingTable } from './lib/extension/relatedTables/userMappingTable';
import { UserRow } from './lib/user/userRow';
import { UserTable } from './lib/user/userTable';
import { UserTableReader } from './lib/user/userTableReader';
import { WebPExtension } from './lib/extension/webp';
import { WKB } from './lib/wkb';
import { Db } from './lib/db/db';
import { DBAdapter } from './lib/db/dbAdapter';
import { SqliteAdapter } from './lib/db/sqliteAdapter';
import { Creator } from './lib/tiles/creator/creator';
import { TileCreator } from './lib/tiles/creator/tileCreator';
import { NodeTileCreator } from './lib/tiles/creator/node';
import { Canvas } from './lib/canvas/canvas';
import { CanvasAdapter } from './lib/canvas/canvasAdapter';
import { NodeCanvasAdapter } from './lib/canvas/nodeCanvasAdapter';
import { BrowserCanvasAdapter } from './lib/canvas/browserCanvasAdapter';

const registerCanvasAdapter = Canvas.registerCanvasAdapter;
const registerDbAdapter = Db.registerDbAdapter;
const registerTileCreator = Creator.registerTileCreator;

const setCanvasKitWasmLocateFile = NodeCanvasAdapter.setCanvasKitWasmLocateFile

// node default adapters
registerDbAdapter(SqliteAdapter);
registerTileCreator(NodeTileCreator);
registerCanvasAdapter(NodeCanvasAdapter);


export {
  BoundingBox,
  BrowserCanvasAdapter,
  CanvasAdapter,
  ClosestFeature,
  ContentsDao,
  ContentsIdDao,
  Constraint,
  Constraints,
  CrsWktExtension,
  DataColumnConstraints,
  DataColumnConstraintsDao,
  DataColumns,
  DataColumnsDao,
  DBAdapter,
  DublinCoreMetadata,
  DublinCoreType,
  Extension,
  FeatureColumn,
  FeatureDrawType,
  FeaturePaint,
  FeatureStyle,
  FeatureStyleExtension,
  FeatureStyles,
  FeatureTable,
  FeatureTableIndex,
  FeatureTableReader,
  FeatureTableStyles,
  FeatureTiles,
  GeometryType,
  GeometryColumns,
  GeometryColumnsDao,
  GeometryData,
  GeoPackage,
  GeoPackageAPI,
  GeoPackageConnection,
  GeoPackageDataType,
  GeoPackageTileRetriever,
  GeoPackageValidate,
  IconCache,
  Icons,
  IconTable,
  ImageUtils,
  MediaTable,
  Metadata,
  MetadataDao,
  MetadataExtension,
  MetadataReference,
  NodeCanvasAdapter,
  NumberFeaturesTile,
  OptionBuilder,
  Paint,
  registerCanvasAdapter,
  registerDbAdapter,
  registerTileCreator,
  RelatedTablesExtension,
  RTreeIndex,
  RTreeIndexDao,
  setCanvasKitWasmLocateFile,
  SchemaExtension,
  ShadedFeaturesTile,
  SimpleAttributesTable,
  SpatialReferenceSystem,
  SqliteQueryBuilder,
  StyleMappingTable,
  Styles,
  StyleTable,
  TableCreator,
  TileBoundingBoxUtils,
  TileCreator,
  TileColumn,
  TileMatrix,
  TileMatrixSet,
  TileScaling,
  TileScalingType,
  TileTable,
  UserColumn,
  UserDao,
  UserMappingTable,
  UserRow,
  UserTable,
  UserTableReader,
  WebPExtension,
  WKB,
};
