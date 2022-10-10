var testSetup = require('../../testSetup').default
  , Verification = require('../../verification')
  , DataColumns = require('../../../lib/extension/schema/columns/dataColumns').DataColumns
  , DataColumnsDao = require('../../../lib/extension/schema/columns/dataColumnsDao').DataColumnsDao
  , AttributesDao = require('../../../lib/attributes/attributesDao').AttributesDao
  , AttributesTableReader = require('../../../lib/attributes/attributesTableReader').AttributesTableReader
  , AttributesTable = require('../../../lib/attributes/attributesTable').AttributesTable
  , GeoPackageDataType = require('../../../lib/db/geoPackageDataType').GeoPackageDataType
  , Contents = require('../../../lib/contents/contents').Contents
  , ConstraintType = require('../../../lib/db/table/constraintType').ConstraintType
  , Constraints = require('../../../lib/db/table/constraints').Constraints
const { AttributesColumn } = require("../../../lib/attributes/attributesColumn");
const { AttributesTableMetadata } = require("../../../lib/attributes/attributesTableMetadata");
const { ContentsDataType } = require("../../../lib/contents/contentsDataType");
const { SchemaExtension } = require("../../../lib/extension/schema/schemaExtension");
const { UserCustomColumn } = require("../../../lib/user/custom/userCustomColumn");

describe('GeoPackage Attribute table create tests', function() {
  var testGeoPackage;
  var tableName = 'test_attributes.test';
  var geoPackage;

  const notNullPrimaryKeyConstraints = {
    constraints: [
      {
        name: null,
        order: AttributesColumn.NOT_NULL_CONSTRAINT_ORDER,
        sql: "NOT NULL",
        type: ConstraintType.NOT_NULL
      },
      {
        name: null,
        sql: "PRIMARY KEY",
        order: AttributesColumn.PRIMARY_KEY_CONSTRAINT_ORDER,
        type: ConstraintType.PRIMARY_KEY
      },
      {
        name: null,
        order: AttributesColumn.AUTOINCREMENT_CONSTRAINT_ORDER,
        sql: "AUTOINCREMENT",
        type: ConstraintType.AUTOINCREMENT
      }
    ],
    typedConstraints: {
      "0": [
        {
          name: null,
          order: AttributesColumn.PRIMARY_KEY_CONSTRAINT_ORDER,
          sql: "PRIMARY KEY",
          type: ConstraintType.PRIMARY_KEY,
        }
      ],
      "4": [
        {
          name: null,
          order: AttributesColumn.NOT_NULL_CONSTRAINT_ORDER,
          sql: "NOT NULL",
          type: ConstraintType.NOT_NULL,
        }
      ],
      "7": [
        {
          name: null,
          order: AttributesColumn.AUTOINCREMENT_CONSTRAINT_ORDER,
          sql: "AUTOINCREMENT",
          type: ConstraintType.AUTOINCREMENT,
        }
      ]
    }
  };

  const emptyConstraints = {
    constraints: [],
    typedConstraints: {},
  };

  const defaultConstraints = value => {
    return {
      constraints: [{
        name: null,
        order: AttributesColumn.DEFAULT_VALUE_CONSTRAINT_ORDER,
        sql: "DEFAULT " + value,
        type: ConstraintType.DEFAULT
      }],
      typedConstraints: {
        "5": [
          {
            name: null,
            order: AttributesColumn.DEFAULT_VALUE_CONSTRAINT_ORDER,
            sql: "DEFAULT " + value,
            type: ConstraintType.DEFAULT,
          }
        ]
      },
    };
  }

  const notNullConstraints = {
    constraints: [
      {
        name: null,
        order: AttributesColumn.NOT_NULL_CONSTRAINT_ORDER,
        sql: "NOT NULL",
        type: ConstraintType.NOT_NULL
      },
    ],
    typedConstraints: {
      "4": [
        {
          name: null,
          order: AttributesColumn.NOT_NULL_CONSTRAINT_ORDER,
          sql: "NOT NULL",
          type: ConstraintType.NOT_NULL,
        }
      ],
    }
  };

  beforeEach(async function() {
    let created = await testSetup.createTmpGeoPackage();
    testGeoPackage = created.path;
    geoPackage = created.geoPackage;
  });

  afterEach(async function() {
    geoPackage.close();
    await testSetup.deleteGeoPackage(testGeoPackage);
  });

  it('should create an attribute table only', async function() {
    geoPackage.hasAttributeTable(tableName).should.be.equal(false);
    var columns = [];
    columns.push(AttributesColumn.createPrimaryKeyColumnWithIndex(0, 'id'));
    columns.push(AttributesColumn.createColumnWithIndex(6, 'test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumnWithIndex(7, 'test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    columns.push(AttributesColumn.createColumnWithIndex(1, 'test_text.test', GeoPackageDataType.TEXT, false, ""));
    columns.push(AttributesColumn.createColumnWithIndex(2, 'test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(3, 'test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(4, 'test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(5, 'test_integer.test', GeoPackageDataType.INTEGER, false, null));
    geoPackage.createAttributesTable(new AttributesTable(tableName, columns));
    var contentsVerified = Verification.verifyContentsForTable(geoPackage, tableName);
    contentsVerified.should.be.equal(false);
    var attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
    attributesTableExists.should.be.equal(true);
    geoPackage.hasAttributeTable(tableName).should.be.equal(false);
    geoPackage.deleteTable(tableName);
    attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
    attributesTableExists.should.be.equal(false);
  });

  it('should create an attribute table and associated contents', async function() {
    geoPackage.hasAttributeTable(tableName).should.be.equal(false);
    var columns = [];
    columns.push(AttributesColumn.createPrimaryKeyColumnWithIndex(0, 'id'));
    columns.push(AttributesColumn.createColumnWithIndex(6, 'test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumnWithIndex(7, 'test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    columns.push(AttributesColumn.createColumnWithIndex(1, 'test_text.test', GeoPackageDataType.TEXT, false, ""));
    columns.push(AttributesColumn.createColumnWithIndex(2, 'test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(3, 'test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(4, 'test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(5, 'test_integer.test', GeoPackageDataType.INTEGER, false, null));
    const table = new AttributesTable(tableName, columns)
    geoPackage.createAttributesTable(table);
    // setup contents
    const contents = new Contents();
    contents.setTableName(tableName);
    contents.setDataTypeName(ContentsDataType.nameFromType(ContentsDataType.ATTRIBUTES));
    contents.setIdentifier(tableName);
    geoPackage.getContentsDao().create(contents);
    table.setContents(contents);
    var contentsVerified = Verification.verifyContentsForTable(geoPackage, tableName);
    contentsVerified.should.be.equal(true);
    var attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
    attributesTableExists.should.be.equal(true);
    geoPackage.hasAttributeTable(tableName).should.be.equal(true);
    geoPackage.deleteTable(tableName);
    attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
    attributesTableExists.should.be.equal(false);
  });

  it('should create an attribute table and contents', async function() {
    geoPackage.hasAttributeTable(tableName).should.be.equal(false);
    var columns = [];
    columns.push(AttributesColumn.createColumnWithIndex(6, 'test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumnWithIndex(7, 'test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    columns.push(AttributesColumn.createColumnWithIndex(1, 'test_text.test', GeoPackageDataType.TEXT, false, ""));
    columns.push(AttributesColumn.createColumnWithIndex(2, 'test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(3, 'test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(4, 'test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumnWithIndex(5, 'test_integer.test', GeoPackageDataType.INTEGER, false, null));
    geoPackage.createAttributesTableWithMetadata(AttributesTableMetadata.create(tableName, columns));
    var contentsVerified = Verification.verifyContentsForTable(geoPackage, tableName);
    contentsVerified.should.be.equal(true);
    var attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
    attributesTableExists.should.be.equal(true);
    geoPackage.hasAttributeTable(tableName).should.be.equal(true);
  });

  it('should create an attribute table using an attribute table metadata', function() {
    var attributesColumns = [];
    attributesColumns.push(AttributesColumn.createColumn('Name', GeoPackageDataType.TEXT));
    attributesColumns.push(AttributesColumn.createColumn('Number', GeoPackageDataType.INTEGER));

    // alternative api call to create attributes table metadata
    const metadata = AttributesTableMetadata.create('NewTable', attributesColumns);
    geoPackage.createAttributesTableWithMetadata(metadata);

    // create the data columns table
    var schemaExtension = new SchemaExtension(geoPackage);
    schemaExtension.createDataColumnsTable();
    schemaExtension.createDataColumnConstraintsTable();

    // get the data columns dao and create the data columns
    const dataColumnsDao = geoPackage.getDataColumnsDao();
    var nameDataCol = new DataColumns();
    nameDataCol.setTableName('NewTable');
    nameDataCol.setColumnName('Name');
    nameDataCol.setName('The Name');
    nameDataCol.setTitle('The Title');
    nameDataCol.setDescription('Description');
    nameDataCol.setMimeType('text');
    nameDataCol.setConstraintName(null);
    dataColumnsDao.create(nameDataCol);

    var reader = new AttributesTableReader('NewTable');
    var result = reader.readAttributeTable(geoPackage);
    var columns = result.getUserColumns().getColumns();
    var plainObject = JSON.parse(JSON.stringify(columns));
    plainObject.should.deep.include.members([{
      constraints: notNullPrimaryKeyConstraints,
      index: 0,
      type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER),
      name: 'id',
      dataType: 5,
      max: null,
      notNull: true,
      primaryKey: true,
      autoincrement: true,
    },
      {
        index: 1,
        constraints: {
          constraints: [],
          typedConstraints: {},
        },
        name: 'Name',
        max: null,
        dataType: 9,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.TEXT)
      },
      {
        index: 2,
        constraints: {
          constraints: [],
          typedConstraints: {},
        },
        name: 'Number',
        max: null,
        dataType: 5,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER)
      }]);

    var dc = new DataColumnsDao(geoPackage);
    var dataColumn = dc.getDataColumns('NewTable', 'Name');
    dataColumn.should.be.deep.equal(nameDataCol);
  });

  it('should create a media table', function() {
   try {

   } catch (e) {
     console.error(e);
   }
  });

  it('should create a simple attribute table', function() {
    try {
      var attributesColumns = [];
      attributesColumns.push(UserCustomColumn.createColumn('Name', GeoPackageDataType.TEXT, true));
      attributesColumns.push(UserCustomColumn.createColumn('Number', GeoPackageDataType.INTEGER, true));
      geoPackage.createSimpleAttributesTable('SimpleTable', attributesColumns)
      var reader = new AttributesTableReader('SimpleTable');
      var result = reader.readAttributeTable(geoPackage);
      var columns = result.getUserColumns().getColumns();
      var plainObject = JSON.parse(JSON.stringify(columns));
      plainObject.should.deep.include.members([
        {
          index: 0,
          name: 'id',
          dataType: 5,
          notNull: true,
          primaryKey: true,
          autoincrement: true,
          max: null,
          type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER),
          constraints: notNullPrimaryKeyConstraints,
        },
        {
          index: 1,
          name: 'Name',
          dataType: 9,
          notNull: true,
          primaryKey: false,
          autoincrement: false,
          max: null,
          type: GeoPackageDataType.nameFromType(GeoPackageDataType.TEXT),
          constraints: notNullConstraints,
        },
        {
          index: 2,
          name: 'Number',
          dataType: 5,
          notNull: true,
          primaryKey: false,
          autoincrement: false,
          max: null,
          type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER),
          constraints: notNullConstraints,
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  });

  it('should not allow two primary key columns', function() {
    var columns = [];
    columns.push(AttributesColumn.createPrimaryKeyColumn('id'));
    columns.push(AttributesColumn.createPrimaryKeyColumn('idagain'));
    (function() {
      new AttributesTable(tableName, columns);
    }).should.throw();
  });

  it('should not allow missing column indexes', function() {
    var columns = [];

    columns.push(AttributesColumn.createPrimaryKeyColumnWithIndex(1, 'id'));
    columns.push(AttributesColumn.createPrimaryKeyColumnWithIndex(2, 'idagain'));

    (function() {
      new AttributesTable(tableName, columns);
    }).should.throw();
  });

  it('should fail to create an attribute table with an incorrect contents type', function() {
    var columns = [];

    columns.push(AttributesColumn.createPrimaryKeyColumn('id'));
    columns.push(AttributesColumn.createColumn('test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumn('test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    columns.push(AttributesColumn.createColumn('test_text.test', GeoPackageDataType.TEXT, false, ""));
    columns.push(AttributesColumn.createColumn('test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumn('test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumn('test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumn('test_integer.test', GeoPackageDataType.INTEGER, false, null));

    var table = new AttributesTable('table', columns);
    (function() {
      var contents = new Contents();
      contents.data_type = 'invalid';
      table.setContents(contents);
    }).should.throw();
  });

  it('should fail to create an attribute dao with no contents', function() {
    var columns = [];

    columns.push(AttributesColumn.createPrimaryKeyColumn('id'));
    columns.push(AttributesColumn.createColumn('test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumn('test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    columns.push(AttributesColumn.createColumn('test_text.test', GeoPackageDataType.TEXT, false, ""));
    columns.push(AttributesColumn.createColumn('test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumn('test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumn('test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumn('test_integer.test', GeoPackageDataType.INTEGER, false, null));

    var table = new AttributesTable(geoPackage.connection, columns);

    (function() {
      new AttributesDao(geoPackage, table);
    }).should.throw();
  });

  it('should create a attribute table and read the information about it', function() {
    var columns = [];
    columns.push(AttributesColumn.createColumn('test_text.test', GeoPackageDataType.TEXT, false, "default"));
    columns.push(AttributesColumn.createColumn('test_real.test', GeoPackageDataType.REAL, false, null));
    columns.push(AttributesColumn.createColumn('test_boolean.test', GeoPackageDataType.BOOLEAN, false, null));
    columns.push(AttributesColumn.createColumn('test_blob.test', GeoPackageDataType.BLOB, false, null));
    columns.push(AttributesColumn.createColumn('test_integer.test', GeoPackageDataType.INTEGER, false, 5));
    columns.push(AttributesColumn.createColumn('test_text_limited.test', GeoPackageDataType.TEXT, false, null, 5));
    columns.push(AttributesColumn.createColumn('test_blob_limited.test', GeoPackageDataType.BLOB, false, null, 7));
    geoPackage.createAttributesTableWithMetadata(AttributesTableMetadata.create(tableName, columns, new Constraints()));

    // create the data columns table
    var schemaExtension = new SchemaExtension(geoPackage);
    schemaExtension.createDataColumnsTable();
    schemaExtension.createDataColumnConstraintsTable();

    const dataColumnsDao = geoPackage.getDataColumnsDao()
    var dc = new DataColumns();
    dc.setTableName('test_attributes.test');
    dc.setColumnName('test_text_limited.test');
    dc.setName('Test Name');
    dc.setTitle('Test');
    dc.setDescription('Test Description');
    dc.setMimeType('text/html');
    dc.setConstraintName('test constraint');
    dataColumnsDao.create(dc);

    var reader = new AttributesTableReader(tableName);
    var result = reader.readAttributeTable(geoPackage);
    columns = result.getUserColumns().getColumns();
    var plainObject = JSON.parse(JSON.stringify(columns));
    plainObject.should.deep.include.members([
      {
        index: 0,
        name: 'id',
        dataType: 5,
        notNull: true,
        primaryKey: true,
        autoincrement: true,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER),
        constraints: notNullPrimaryKeyConstraints,
      },
      {
        index: 1,
        name: 'test_text.test',
        dataType: 9,
        notNull: false,
        defaultValue: "\'default\'",
        primaryKey: false,
        autoincrement: false,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.TEXT),
        constraints: defaultConstraints('\'default\''),
      },
      {
        index: 2,
        name: 'test_real.test',
        dataType: 8,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.REAL),
        constraints: emptyConstraints,
      },
      {
        index: 3,
        name: 'test_boolean.test',
        dataType: 0,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.BOOLEAN),
        constraints: emptyConstraints,
      },
      {
        index: 4,
        name: 'test_blob.test',
        dataType: 10,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.BLOB),
        constraints: emptyConstraints,
      },
      {
        index: 5,
        name: 'test_integer.test',
        dataType: 5,
        notNull: false,
        defaultValue: '5',
        primaryKey: false,
        autoincrement: false,
        max: null,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.INTEGER),
        constraints: defaultConstraints(5),
      },
      {
        index: 6,
        name: 'test_text_limited.test',
        dataType: 9,
        max: 5,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.TEXT),
        constraints: emptyConstraints,
      },
      {
        index: 7,
        name: 'test_blob_limited.test',
        dataType: 10,
        max: 7,
        notNull: false,
        primaryKey: false,
        autoincrement: false,
        type: GeoPackageDataType.nameFromType(GeoPackageDataType.BLOB),
        constraints: emptyConstraints,
      }]);
    var dataColumn = dataColumnsDao.getDataColumns('test_attributes.test', 'test_text_limited.test');
    dataColumn.should.be.deep.equal(dc);
  });

  describe('GeoPackage attribute CRUD tests', function(done) {
    beforeEach(function() {
      var columns = [];
      columns.push(AttributesColumn.createColumn('test_text_limited', GeoPackageDataType.TEXT, false, null, 5));
      columns.push(AttributesColumn.createColumn('test_blob_limited', GeoPackageDataType.BLOB, false, null, 7));
      columns.push(AttributesColumn.createColumn('test_boolean2', GeoPackageDataType.BOOLEAN, false, null));
      columns.push(AttributesColumn.createColumn('test_text.test', GeoPackageDataType.TEXT, false, ""));
      columns.push(AttributesColumn.createColumn('test_real', GeoPackageDataType.REAL, false, null));
      columns.push(AttributesColumn.createColumn('test_boolean', GeoPackageDataType.BOOLEAN, false, null));
      columns.push(AttributesColumn.createColumn('test_blob', GeoPackageDataType.BLOB, false, null));
      columns.push(AttributesColumn.createColumn('test_integer', GeoPackageDataType.INTEGER, false, null));
      columns.push(AttributesColumn.createColumn('test space', GeoPackageDataType.TEXT, false, ""));
      columns.push(AttributesColumn.createColumn('test-dash', GeoPackageDataType.TEXT, false, ""));

      geoPackage.createAttributesTableWithMetadata(AttributesTableMetadata.create(tableName, columns));
      var contentsVerified = Verification.verifyContentsForTable(geoPackage, tableName);
      contentsVerified.should.be.equal(true);
      var attributesTableExists = Verification.verifyTableExists(geoPackage, tableName);
      attributesTableExists.should.be.equal(true);
    });

    it('should create an attribute', function() {
      try {
        var attributeDao = geoPackage.getAttributesDao(tableName);
        var attributeRow = attributeDao.newRow();
        attributeRow.setValueWithColumnName('test_text.test', 'hello');
        attributeRow.setValueWithColumnName('test_real', 3.0);
        attributeRow.setValueWithColumnName('test_boolean', true);
        attributeRow.setValueWithColumnName('test_boolean2', false);
        attributeRow.setValueWithColumnName('test_blob', Buffer.from('test'));
        attributeRow.setValueWithColumnName('test_integer', 5);
        attributeRow.setValueWithColumnName('test_text_limited', 'testt');
        attributeRow.setValueWithColumnName('test_blob_limited', Buffer.from('testtes'));
        attributeRow.setValueWithColumnName('test space', 'space space');
        attributeRow.setValueWithColumnName('test-dash', 'dash-dash');
        console.log(attributeRow);
        attributeDao.create(attributeRow);
        const count = attributeDao.getCount();
        count.should.be.equal(1);
        var ar = attributeDao.queryForAll().next().value;
        ar.getValueWithColumnName('test_text.test').should.be.equal('hello');
        ar.getValueWithColumnName('test_real').should.be.equal(3.0);
        ar.getValueWithColumnName('test_boolean').should.be.equal(true);
        ar.getValueWithColumnName('test_integer').should.be.equal(5);
        ar.getValueWithColumnName('test_blob').toString().should.be.equal('test');
        ar.getValueWithColumnName('test_text_limited').should.be.equal('testt');
        ar.getValueWithColumnName('test_blob_limited').toString().should.be.equal('testtes');
        ar.getValueWithColumnName('test space').toString().should.be.equal('space space');
        ar.getValueWithColumnName('test-dash').toString().should.be.equal('dash-dash');
      } catch (e) {
        console.error(e);
      }
    });

    describe('delete attribute tests', function(done) {
      var attributeDao;

      beforeEach(function() {
        attributeDao = geoPackage.getAttributesDao(tableName);
        var attributeRow = attributeDao.createObject();
        attributeRow.setValueWithColumnName('test_text.test', 'hello');
        attributeRow.setValueWithColumnName('test_real', 3.0);
        attributeRow.setValueWithColumnName('test_boolean', attributeRow.toObjectValue(3, 1));
        attributeRow.setValueWithColumnName('test_boolean2', attributeRow.toObjectValue(10, 0));
        attributeRow.setValueWithColumnName('test_blob', Buffer.from('test'));
        attributeRow.setValueWithColumnName('test_integer', 5);
        attributeRow.setValueWithColumnName('test_text_limited', 'testt');
        attributeRow.setValueWithColumnName('test_blob_limited', Buffer.from('testtes'));
        attributeRow.setValueWithColumnName('test space', 'space space');
        attributeRow.setValueWithColumnName('test-dash', 'dash-dash');

        attributeDao.create(attributeRow);
        var count = attributeDao.getCount();
        count.should.be.equal(1);
        var ar = attributeDao.queryForAll().next().value;
        ar.getValueWithColumnName('test_text.test').should.be.equal('hello');
        ar.getValueWithColumnName('test_real').should.be.equal(3.0);
        ar.getValueWithColumnName('test_boolean').should.be.equal(true);
        ar.getValueWithColumnName('test_boolean2').should.be.equal(false);
        ar.getValueWithColumnName('test_integer').should.be.equal(5);
        ar.getValueWithColumnName('test_blob').toString().should.be.equal('test');
        ar.getValueWithColumnName('test_text_limited').should.be.equal('testt');
        ar.getValueWithColumnName('test_blob_limited').toString().should.be.equal('testtes');
        ar.getValueWithColumnName('test space').toString().should.be.equal('space space');
        ar.getValueWithColumnName('test-dash').toString().should.be.equal('dash-dash');
      });

      it('should delete the attribute', function() {
        var count = attributeDao.getCount();
        count.should.be.equal(1);
        var ar = attributeDao.queryForAll().next().value;
        attributeDao.delete(ar);
        count = attributeDao.getCount();
        count.should.be.equal(0);
      });
    });
  });

});
