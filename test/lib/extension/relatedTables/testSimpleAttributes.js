import { default as testSetup } from '../../../testSetup'
import {RelatedTablesExtension} from '../../../../lib/extension/related/relatedTablesExtension';
import {ContentsDataType} from "../../../../lib/contents/contentsDataType";

var DataType = require('../../../../lib/db/geoPackageDataType').GeoPackageDataType
  , Verification = require('../../../verification')
  , ContentsDao = require('../../../../lib/contents/contentsDao').ContentsDao
  , UserMappingTable = require('../../../../lib/extension/related/userMappingTable').UserMappingTable
  , SimpleAttributesTable = require('../../../../lib/extension/related/simple/simpleAttributesTable').SimpleAttributesTable
  , RelatedTablesUtils = require('./relatedTablesUtils')
  , should = require('chai').should()
  , path = require('path');

describe('Related Simple Attributes tests', function() {

  var testGeoPackage;
  var testPath = path.join(__dirname, '..', '..', '..', 'fixtures', 'tmp');
  var geoPackage;

  var tileBuffer;

  var filename;
  beforeEach('create the GeoPackage connection', async function() {

    var originalFilename = path.join(__dirname, '..', '..', '..', 'fixtures', 'attributes.gpkg');
    // @ts-ignore
    let result = await copyAndOpenGeopackage(originalFilename);
    filename = result.path;
    geoPackage = result.geoPackage;
    // @ts-ignore
    tileBuffer = await loadTile(path.join(__dirname, '..', '..', '..', 'fixtures', 'tiles', '0', '0', '0.png'));
  });

  afterEach('delete the geoPackage', async function() {
    geoPackage.close();
    await testSetup.deleteGeoPackage(filename);
  })

  function validateContents(simpleAttributesTable, contents) {
    should.exist(contents);
    should.exist(contents.data_type);
    SimpleAttributesTable.RELATION_TYPE.dataType.should.be.equal(contents.data_type);
    simpleAttributesTable.getTableName().should.be.equal(contents.table_name);
    should.exist(contents.last_change);
  }

  it('should create a simple attributes relationship', function() {
    var rte = new RelatedTablesExtension(geoPackage);
    rte.has().should.be.equal(false);

    var extendedRelationships = rte.getRelationships();
    extendedRelationships.length.should.be.equal(0);

    var attributesTables = geoPackage.getAttributesTables();

    var baseTableName = geoPackage.getAttributesTables()[0];

    // Validate nullable non simple columns
    try {
      SimpleAttributesTable.create('simple_table', RelatedTablesUtils.createAdditionalUserColumns(SimpleAttributesTable.numRequiredColumns(), false));
      should.fail('Simple Attributes Table', undefined, 'Simple Attributes Table created with nullable non simple columns');
    } catch (error) {
      // pass
    }

    // Validate non nullable non simple columns
    try {
      SimpleAttributesTable.create('simple_table', RelatedTablesUtils.createAdditionalUserColumns(SimpleAttributesTable.numRequiredColumns(), true));
      should.fail('Simple Attributes Table', undefined, 'Simple Attributes Table created with non nullable non simple columns');
    } catch (error) {
      // pass
    }

    // Validate nullable simple columns
    try {
      SimpleAttributesTable.create('simple_table', RelatedTablesUtils.createSimpleUserColumns(SimpleAttributesTable.numRequiredColumns(), false));
      should.fail('Simple Attributes Table', undefined, 'Simple Attributes Table created with nullable simple columns');
    } catch (error) {
      // pass
    }

    // Populate and validate a simple attribute table
    var simpleUserColumns = RelatedTablesUtils.createSimpleUserColumns(SimpleAttributesTable.numRequiredColumns(), true);
    var simpleTable = SimpleAttributesTable.create('simple_table', simpleUserColumns);
    var simpleColumns = simpleTable.getUserColumns().getColumnNames();
    simpleColumns.length.should.be.equal(SimpleAttributesTable.numRequiredColumns() + simpleUserColumns.length);

    var idColumn = simpleTable.getIdColumn();
    should.exist(idColumn);
    idColumn.name.should.be.equal(SimpleAttributesTable.COLUMN_ID);
    idColumn.dataType.should.be.equal(DataType.INTEGER);
    idColumn.notNull.should.be.equal(true);
    idColumn.primaryKey.should.be.equal(true);

    var additionalMappingColumns = RelatedTablesUtils.createAdditionalUserColumns(UserMappingTable.numRequiredColumns());
    var mappingTableName = 'attributes_simple_attributes';
    var userMappingTable = UserMappingTable.create(mappingTableName, additionalMappingColumns);
    rte.has(userMappingTable.getTableName()).should.be.equal(false);
    userMappingTable.getUserColumns().getColumnNames().length.should.be.equal(UserMappingTable.numRequiredColumns() + additionalMappingColumns.length);

    var baseIdColumn = userMappingTable.baseIdColumn;
    should.exist(baseIdColumn);
    baseIdColumn.name.should.be.equal(UserMappingTable.COLUMN_BASE_ID);
    baseIdColumn.dataType.should.be.equal(DataType.INTEGER);
    baseIdColumn.notNull.should.be.equal(true);
    baseIdColumn.primaryKey.should.be.equal(false);

    var relatedIdColumn = userMappingTable.relatedIdColumn;
    should.exist(relatedIdColumn);
    relatedIdColumn.name.should.be.equal(UserMappingTable.COLUMN_RELATED_ID);
    relatedIdColumn.dataType.should.be.equal(DataType.INTEGER);
    relatedIdColumn.notNull.should.be.equal(true);
    relatedIdColumn.primaryKey.should.be.equal(false);
    rte.has(userMappingTable.getTableName()).should.be.equal(false);

    // Create the simple attributes table, content row, and relationship between the
	  // attributes table and simple attributes table
    var contentsDao = geoPackage.contentsDao;
    var contentsTables = contentsDao.getTables();
    contentsTables.indexOf(simpleTable.getTableName()).should.be.equal(-1);
    var relationship = RelatedTablesExtension.RelationshipBuilder()
      .setBaseTableName(baseTableName)
      .setRelatedTable(simpleTable)
      .setUserMappingTable(userMappingTable);

    let extendedRelation = rte.addSimpleAttributesRelationship(relationship)
    validateContents(simpleTable, simpleTable.contents);
    rte.has().should.be.equal(true);
    rte.has(userMappingTable.getTableName()).should.be.equal(true);
    should.exist(extendedRelation);
    var relationships = rte.getRelationships();
    relationships.length.should.be.equal(1);
    geoPackage.isTable(mappingTableName).should.be.equal(true);
    geoPackage.isTable(simpleTable.getTableName()).should.be.equal(true);
    contentsDao.getTables().indexOf(simpleTable.getTableName()).should.not.be.equal(-1);
    validateContents(simpleTable, contentsDao.queryForId(simpleTable.getTableName()));
    SimpleAttributesTable.RELATION_TYPE.dataType.should.be.equal(geoPackage.getTableType(simpleTable.getTableName()));
    geoPackage.isTableType(SimpleAttributesTable.RELATION_TYPE.dataType, simpleTable.getTableName());

    // Validate the simple attributes DAO
    var simpleDao = rte.getSimpleAttributesDao(simpleTable);
    should.exist(simpleDao);
    simpleTable = simpleDao.table;
    should.exist(simpleTable);
    validateContents(simpleTable, simpleTable.contents);

    // Insert simple attributes table rows
    var simpleCount = 2 + Math.floor(Math.random() * 9);
    var simpleRowId = 0;

    for (i = 0; i < simpleCount-1; i++) {
      var simpleRow = simpleDao.newRow();
      RelatedTablesUtils.populateRow(simpleTable, simpleRow, SimpleAttributesTable.requiredColumns());
      simpleRowId = simpleDao.create(simpleRow);
      simpleRowId.should.be.greaterThan(0);
    }

    // copy the last row insert and insert the final simple row
    var simpleRowToCopy = simpleDao.queryForId(simpleRowId);
    simpleRowToCopy.resetId();
    var copiedSimpleId = simpleDao.create(simpleRowToCopy);
    copiedSimpleId.should.be.greaterThan(0);
    copiedSimpleId.should.be.equal(simpleRowId + 1);
    simpleCount.should.be.equal(simpleDao.count());

    // Build the Attributes Ids
    var attributesDao = geoPackage.getAttributeDao(baseTableName);
    var allAttributes = attributesDao.queryForAll();
    var attributeIds = [];
    for (var i = 0; i < allAttributes.length; i++) {
      const row = attributesDao.getRow(allAttributes[i]);
      attributeIds.push(row.id);
    }

    var allSimpleAttributes = simpleDao.queryForAll();
    var simpleIds = [];
    for (var i = 0; i < allSimpleAttributes.length; i++) {
      const row = simpleDao.getRow(allSimpleAttributes[i]);
      simpleIds.push(row.id);
    }

    // Insert user mapping rows between feature ids and attribute ids
    userMappingDao = rte.getMappingDao(mappingTableName);
    for (i = 0; i < 10; i++) {
      var userMappingRow = userMappingDao.newRow();
      userMappingRow.baseId = attributeIds[Math.floor(Math.random() * attributeIds.length)];
      userMappingRow.relatedId = simpleIds[Math.floor(Math.random() * simpleIds.length)];
      RelatedTablesUtils.populateRow(userMappingTable, userMappingRow, UserMappingTable.requiredColumns());
      var created = userMappingDao.create(userMappingRow);
      created.should.be.greaterThan(0);
    }

    userMappingDao.count().should.be.equal(10);

    // Validate the user mapping rows
    userMappingTable = userMappingDao.table;
    var mappingColumns = userMappingTable.getUserColumns().getColumnNames();
    var userMappingRows = userMappingDao.queryForAll();
    var count = userMappingRows.length;
    count.should.be.equal(10);
    var manualCount = 0;

    for (var i = 0; i < count; i++) {
      var umr = userMappingRows[i];
      var row2 = userMappingDao.getUserMappingRow(umr);
      row2.hasId().should.be.equal(false);
      attributeIds.indexOf(row2.baseId.should.be.not.equal(-1));
      simpleIds.indexOf(row2.relatedId.should.be.not.equal(-1));
      RelatedTablesUtils.validateUserRow(mappingColumns, row2);
      RelatedTablesUtils.validateDublinCoreColumns(row2);
      manualCount++;
    }

    manualCount.should.be.equal(count);

    var extendedRelationsDao = rte.extendedRelationDao;
    var attributeBaseTableRelations = extendedRelationsDao.getBaseTableRelations(attributesDao.table_name);
    var attributeTableRelations = extendedRelationsDao.getTableRelations(attributesDao.table_name);
    attributeBaseTableRelations.length.should.be.equal(1);
    attributeTableRelations.length.should.be.equal(1);
    attributeBaseTableRelations[0].id.should.be.equal(attributeTableRelations[0].id);
    extendedRelationsDao.getRelatedTableRelations(attributesDao.table_name).length.should.be.equal(0);

    // Test the attribute table relations
    for (var i = 0; i < attributeBaseTableRelations.length; i++) {

      // Test the relation
      var attributeRelation = attributeBaseTableRelations[i];
      attributeRelation.id.should.be.greaterThan(0);
      attributesDao.table_name.should.be.equal(attributeRelation.base_table_name);
      attributesDao.table.getPkColumn().name.should.be.equal(attributeRelation.base_primary_column);
      simpleDao.getTableName().should.be.equal(attributeRelation.related_table_name);
      simpleDao.table.getPkColumn().name.should.be.equal(attributeRelation.related_primary_column);
      SimpleAttributesTable.RELATION_TYPE.name.should.be.equal(attributeRelation.relation_name);

      // test the user mappings from the relation
      var userMappingDao = rte.getMappingDao(attributeRelation.mapping_table_name);
      var totalMappedCount = userMappingDao.count();
      var mappings = userMappingDao.queryForAll();
      for (var m = 0; m < mappings.length; m++) {
        umr = userMappingDao.getUserMappingRow(mappings[i]);
        attributeIds.indexOf(umr.baseId.should.not.be.equal(-1));
        simpleIds.indexOf(umr.relatedId).should.not.be.equal(-1);
        RelatedTablesUtils.validateUserRow(mappingColumns, umr);
        RelatedTablesUtils.validateDublinCoreColumns(umr);
      }

      // get and test the attributes DAO
      simpleDao = rte.getSimpleAttributesDao(attributeRelation);
      should.exist(simpleDao);
      simpleTable = simpleDao.table;
      should.exist(simpleTable);
      validateContents(simpleTable, simpleTable.contents);

      var totalMapped = 0;

      // get and test the Attributes Rows mapped to each Simple Attributes Row
      var attributes = attributesDao.queryForAll();
      for (var f = 0; f < attributes.length; f++) {
        var attributeRow = attributesDao.getRow(attributes[f]);
        var mappedIds = rte.getMappingsForBase(attributeRelation, attributeRow.id);
        var simpleRows = simpleDao.getRows(mappedIds);
        simpleRows.length.should.be.equal(mappedIds.length);

        simpleRows.forEach(function(simpleRow) {
          simpleRow.hasId().should.be.equal(true);
          simpleRow.id.should.be.greaterThan(0);
          simpleIds.indexOf(simpleRow.id).should.not.be.equal(-1);
          mappedIds.indexOf(simpleRow.id).should.not.be.equal(-1);
          RelatedTablesUtils.validateUserRow(simpleColumns, simpleRow);
          RelatedTablesUtils.validateSimpleDublinCoreColumns(simpleRow);
        });

        totalMapped += mappedIds.length;
      }
      totalMappedCount.should.be.equal(totalMapped);
    }

    // Get the relations starting from the simple attributes table
    var simpleRelatedTableRelations = extendedRelationsDao.getRelatedTableRelations(simpleTable.getTableName());
    var simpleTableRelations = extendedRelationsDao.getTableRelations(simpleTable.getTableName());

    simpleRelatedTableRelations.length.should.be.equal(1);
    simpleTableRelations.length.should.be.equal(1);
    simpleRelatedTableRelations[0].id.should.be.equal(simpleTableRelations[0].id);
    extendedRelationsDao.getBaseTableRelations(simpleTable.getTableName()).length.should.be.equal(0);

    // Test the media table relations
    simpleRelatedTableRelations.forEach(function(simpleRelation) {

      // Test the relation
      simpleRelation.id.should.be.greaterThan(0);
      attributesDao.table_name.should.be.equal(simpleRelation.base_table_name);
      attributesDao.table.getPkColumn().name.should.be.equal(simpleRelation.base_primary_column);
      simpleDao.table_name.should.be.equal(simpleRelation.related_table_name);
      simpleDao.table.getPkColumn().name.should.be.equal(simpleRelation.related_primary_column);
      SimpleAttributesTable.RELATION_TYPE.name.should.be.equal(simpleRelation.relation_name);
      mappingTableName.should.be.equal(simpleRelation.mapping_table_name);

      // Test the user mappings from the relation
      var userMappingDao = rte.getMappingDao(simpleRelation);
      var totalMappedCount = userMappingDao.count();
      var mappings = userMappingDao.queryForAll();
      var umr;
      mappings.forEach(function(row) {
        umr = userMappingDao.getUserMappingRow(row);
        attributeIds.indexOf(umr.baseId).should.not.be.equal(-1);
        simpleIds.indexOf(umr.relatedId).should.not.be.equal(-1);
        RelatedTablesUtils.validateUserRow(mappingColumns, umr);
        RelatedTablesUtils.validateDublinCoreColumns(umr);
      });

      // Get and test the attributes DAO
      attributesDao = geoPackage.getAttributeDao(attributesDao.table_name);
      should.exist(attributesDao);
      var attributeTable = attributesDao.table;
      should.exist(attributeTable);
      var attributeContents = attributesDao.contents;
      should.exist(attributeContents);
      ContentsDataType.ATTRIBUTES.should.be.equal(attributeContents.data_type);
      attributeTable.getTableName().should.be.equal(attributeContents.table_name);
      should.exist(attributeContents.last_change);

      var simples = simpleDao.queryForAll();
      var totalMapped = 0;
      simples.forEach(function(row) {
        var simpleRow = simpleDao.getRow(row);
        var mappedIds = rte.getMappingsForRelated(simpleRelation.mapping_table_name, simpleRow.id);
        mappedIds.forEach(function(mappedId){
          var attributeRow = attributesDao.queryForId(mappedId);
          should.exist(attributeRow);
          attributeRow.hasId().should.be.equal(true);
          attributeRow.id.should.be.greaterThan(0);
          attributeIds.indexOf(attributeRow.id).should.not.equal(-1);
          mappedIds.indexOf(attributeRow.id).should.not.equal(-1);
        });
        totalMapped += mappedIds.length;
      });

      totalMapped.should.be.equal(totalMappedCount);
    });

    var baseTables = extendedRelationsDao.getBaseTables();
    baseTables.length.should.be.equal(1);
    baseTables[0].should.be.equal(baseTableName);
    var relatedTables = extendedRelationsDao.getRelatedTables();
    relatedTables.length.should.be.equal(1);
    relatedTables[0].should.be.equal(simpleTable.getTableName());

    // Delete a single mapping
    var countOfIds = userMappingDao.countByIds(umr);
    var queryOfIds = userMappingDao.queryByIds(umr);
    var queryCount = 0;
    for (var row of queryOfIds) {
      queryCount++;
    }
    queryCount.should.be.equal(countOfIds);
    countOfIds.should.be.equal(userMappingDao.deleteByIds(umr));
    userMappingDao.count().should.be.equal(10-countOfIds);

    // Delete by base id
    var userMappings = userMappingDao.queryForAll();
    var baseIdQuery = userMappingDao.queryByBaseId(userMappingDao.getUserMappingRow(userMappings[0]));
    var countOfBaseIds = baseIdQuery.length;
    var deleted = userMappingDao.deleteByBaseId(userMappingDao.getUserMappingRow(userMappings[0]));
    deleted.should.be.equal(countOfBaseIds);

    // Delete by related id
    var userMappings = userMappingDao.queryForAll();
    var relatedIdQuery = userMappingDao.queryByRelatedId(userMappingDao.getUserMappingRow(userMappings[0]));
    var countOfRelatedIds = relatedIdQuery.length;
    var deleted = userMappingDao.deleteByRelatedId(userMappingDao.getUserMappingRow(userMappings[0]));
    deleted.should.be.equal(countOfRelatedIds);

    // Delete the relationship and user mapping table
    rte.removeRelationship(extendedRelation);
    rte.has(userMappingTable.getTableName()).should.be.equal(false);
    var relationships = rte.getRelationships();
    relationships.length.should.be.equal(0);
    geoPackage.isTable(mappingTableName).should.be.equal(false);

    // Delete the media table and contents row
    geoPackage.isTable(simpleTable.getTableName());
    should.exist(contentsDao.queryForId(simpleTable.getTableName()));
    geoPackage.deleteTable(simpleTable.getTableName());
    geoPackage.isTable(simpleTable.getTableName()).should.be.equal(false);
    should.not.exist(contentsDao.queryForId(simpleTable.getTableName()));

    // Delete the related tables extension
    rte.removeExtension();
    rte.has().should.be.equal(false);
  });
});
