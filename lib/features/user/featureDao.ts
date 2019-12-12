/**
 * featureDao module.
 * @module features/user/featureDao
 */
import reproject from 'reproject'
import LineIntersect from '@turf/line-intersect'
import Intersect from '@turf/intersect'
import BooleanWithin from '@turf/boolean-within'

import FeatureTableIndex from '../../extension/index/featureTableIndex';
import UserDao from '../../user/userDao';
import DataColumnsDao from '../../dataColumns/dataColumnsDao';
import FeatureRow from './featureRow';
import DataTypes from '../../db/dataTypes'
import { BoundingBox } from '../../boundingBox'
import { Feature } from 'geojson';

/**
 * Feature DAO for reading feature user data tables
 * @class FeatureDao
 * @extends UserDao
 * @param  {any} db              database connection
 * @param  {FeatureTable} table           feature table
 * @param  {GeometryColumns} geometryColumns geometry columns
 * @param  {MetadataDao} metadataDao      metadata dao
 */
export default class FeatureDao extends UserDao<FeatureRow> {
  geometryColumns: any;
  metadataDao: any;
  dataColumnsDao: any;
  featureTableIndex: FeatureTableIndex;
  projection: any;
  constructor(geoPackage, table, geometryColumns, metadataDao) {
    super(geoPackage, table);
    this.geometryColumns = geometryColumns;
    this.metadataDao = metadataDao;
    this.dataColumnsDao = new DataColumnsDao(geoPackage);
    this.featureTableIndex = new FeatureTableIndex(geoPackage, this);
    var dao = geoPackage.getGeometryColumnsDao();
    if (!dao.getContents(geometryColumns)) {
      throw new Error('Geometry Columns ' + dao.getId(geometryColumns) + ' has null Contents');
    }
    if (!dao.getSrs(geometryColumns)) {
      throw new Error('Geometry Columns ' + dao.getId(geometryColumns) + ' has null Spatial Reference System');
    }
    this.projection = dao.getProjection(geometryColumns);
  }
  createObject(results) {
    if (results) {
      return this.getRow(results);
    }
    return this.newRow();
  }
  getContents() {
    var dao = this.geoPackage.getGeometryColumnsDao();
    return dao.getContents(this.geometryColumns);
  }
  /**
   * Get the feature table
   * @return {FeatureTable} the feature table
   */
  getFeatureTable() {
    return this.table;
  }
  /**
   * Create a new feature row with the column types and values
   * @param  {Array} columnTypes column types
   * @param  {Array} values      values
   * @return {FeatureRow}             feature row
   */
  newRowWithColumnTypes(columnTypes, values) {
    return new FeatureRow(this.getFeatureTable(), columnTypes, values);
  }
  /**
   * Create a new feature row
   * @return {FeatureRow} feature row
   */
  newRow() {
    return new FeatureRow(this.getFeatureTable());
  }
  /**
   * Get the geometry column name
   * @return {string} the geometry column name
   */
  getGeometryColumnName() {
    return this.geometryColumns.column_name;
  }
  /**
   * Get the geometry types
   * @return {Number} well known binary geometry type
   */
  getGeometryType() {
    return this.geometryColumns.getGeometryType();
  }
  getSrs() {
    return this.geoPackage.getGeometryColumnsDao().getSrs(this.geometryColumns);
  }
  /**
   * Determine if the feature table is indexed
   * @returns {Boolean} indexed status of the table
   */
  isIndexed() {
    return this.featureTableIndex.isIndexed();
  }
  /**
   * Query for count in bounding box
   * @param boundingBox
   * @returns {Number}}
   */
  countWebMercatorBoundingBox(boundingBox) {
    return this.featureTableIndex.countWithBoundingBox(boundingBox, 'EPSG:3857');
  }
  /**
   * Fast query web mercator bounding box
   * @param {BoundingBox} boundingBox bounding box to query for
   * @returns {any}
   */
  fastQueryWebMercatorBoundingBox(boundingBox) {
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:3857');
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow = thisgetRow(nextRow.value);
          return {
            value: featureRow,
            done: false
          };
        }
        else {
          return {
            done: true
          };
        }
      }
    };
  }
  queryIndexedFeaturesWithWebMercatorBoundingBox(boundingBox) {
    var srs = this.getSrs();
    var projection = this.projection;
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:3857');
    var thisgetRow = this.getRow.bind(this);
    var projectedBoundingBox = boundingBox.projectBoundingBox('EPSG:3857', 'EPSG:4326');
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
            geometry = FeatureDao.verifyFeature(geometry, projectedBoundingBox);
            if (geometry) {
              geometry.properties = featureRow.values;
              return {
                value: featureRow,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }
    };
  }
  /**
   * Calls geoJSONFeatureCallback with the geoJSON of each matched feature (always in 4326 projection)
   * @param  {BoundingBox} boundingBox        4326 bounding box to query
   * @param {Boolean} [skipVerification] do not verify if the feature actually exists in the box
   * @returns {any}
   */
  queryForGeoJSONIndexedFeaturesWithBoundingBox(boundingBox: BoundingBox, skipVerification = false): IterableIterator<Feature> {
    var columns = [];
    var columnMap = {};
    var srs = this.getSrs();
    var projection = this.projection;
    this.table.columns.forEach(function (column) {
      var dataColumn = this.dataColumnsDao.getDataColumns(this.table.table_name, column.name);
      columns.push({
        index: column.index,
        name: column.name,
        max: column.max,
        min: column.min,
        notNull: column.notNull,
        primaryKey: column.primaryKey,
        dataType: column.dataType ? DataTypes.nameFromType(column.dataType) : '',
        displayName: dataColumn && dataColumn.name ? dataColumn.name : column.name,
        dataColumn: dataColumn
      });
      columnMap[column.name] = columns[columns.length - 1];
    }.bind(this));
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:4326')[Symbol.iterator]();
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      // eslint-disable-next-line complexity
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
            if (!skipVerification) {
              geometry = FeatureDao.verifyFeature(geometry, boundingBox);
            }
            if (geometry) {
              var geoJson = {
                id: undefined,
                properties: {},
                geometry: geometry
              };
              for (var key in featureRow.values) {
                if (Object.prototype.hasOwnProperty.call(featureRow.values, key) && key !== featureRow.getGeometryColumn().name && key !== 'id') {
                  if (key.toLowerCase() === '_feature_id') {
                    geoJson.id = featureRow.values[key];
                  }
                  else if (key.toLowerCase() === '_properties_id') {
                    geoJson.properties[key.substring(12)] = featureRow.values[key];
                  }
                  else {
                    geoJson.properties[columnMap[key].displayName] = featureRow.values[key];
                  }
                }
              }
              geoJson.id = geoJson.id || featureRow.getId();
              return {
                value: geoJson,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }.bind(this)
    };
  }
  queryIndexedFeaturesWithBoundingBox(boundingBox) {
    var srs = this.getSrs();
    var projection = this.projection;
    var iterator = this.featureTableIndex.queryWithBoundingBox(boundingBox, 'EPSG:4326');
    var thisgetRow = this.getRow.bind(this);
    return {
      [Symbol.iterator]() {
        return this;
      },
      next: function () {
        var nextRow = iterator.next();
        if (!nextRow.done) {
          var featureRow;
          var geometry;
          while (!nextRow.done && !geometry) {
            featureRow = thisgetRow(nextRow.value);
            geometry = FeatureDao.reprojectFeature(featureRow, srs, projection);
            geometry = FeatureDao.verifyFeature(geometry, boundingBox);
            if (geometry) {
              geometry.properties = featureRow.values;
              return {
                value: featureRow,
                done: false
              };
            }
            else {
              nextRow = iterator.next();
            }
          }
        }
        return {
          done: true
        };
      }.bind(this)
    };
  }
  getBoundingBox() {
    var contents = this.getContents();
    return new BoundingBox(contents.min_x, contents.max_x, contents.min_y, contents.max_y);
  }

  static reprojectFeature(featureRow, srs, projection) {
    var geometry = featureRow.getGeometry().toGeoJSON();
    if (srs.organization + ':' + srs.organization_coordsys_id !== 'EPSG:4326') {
      geometry = reproject.reproject(geometry, projection, 'EPSG:4326');
    }
    return geometry;
  }
  
  static verifyFeature(geometry, boundingBox) {
    try {
      if (geometry.type === 'Point') {
        return geometry;
      } else if (geometry.type === 'LineString') {
        return FeatureDao.verifyLineString(geometry, boundingBox);
      } else if (geometry.type === 'Polygon') {
        return FeatureDao.verifyPolygon(geometry, boundingBox);
      } else if (geometry.type === 'MultiLineString') {
        return FeatureDao.verifyLineString(geometry, boundingBox);
      } else if (geometry.type === 'MultiPolygon') {
        return FeatureDao.verifyPolygon(geometry, boundingBox);
      }
    } catch (e) {
      return false;
    }
  }
  
  static verifyLineString(geometry, boundingBox) {
    var intersect = LineIntersect(geometry, boundingBox.toGeoJSON().geometry);
    if (intersect.features.length) {
      return geometry;
    } else if (BooleanWithin(geometry, boundingBox.toGeoJSON().geometry)) {
      return geometry;
    }
  }
  
  static verifyPolygon(geometry, boundingBox) {
    var polyIntersect = Intersect(geometry, boundingBox.toGeoJSON().geometry);
    if (polyIntersect) {
      return geometry;
    } else if (BooleanWithin(geometry, boundingBox.toGeoJSON().geometry)) {
      return geometry;
    }
  }
}