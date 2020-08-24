// mock database for all ingestions
let ingestions = [
    {
        "id": 1,
        "pipeline": {
            "name": "leads",
            "project_name": "marketing",
            "sourceid": 1,
            "targetid": 1,
            "scheduleid": 1,
            "comments": "this is a default ingestion already included for testing purposes",
            "tags": ['apple', 'banana']
        },
        "source": {
            "id": 1,
            "locationid": 1,
            "locationAttributes": {},
            "delimiter": "comma",
            "formatid": "3",
            "encoding": "UTF8",
            "userAction": {
                "id": null,
                "value": null
            },
            "fields": [
                {
                    "name": "ssn",
                    "type": "TaxId",
                    "nnpi": "yes"
                },
                {
                    "name": "name",
                    "type": "Text",
                    "nnpi": "no"
                }
            ],
            "username" : "lastjedi",
            "password" : "skywalker"        },
        "target": {
            "id": 1,
            "locationid": 3,
            "locationAttributes": {},
            "formatid": "1",
            "delimiter": "colon",
            "encoding": "UTF8",
            "userAction": {
                "id": null,
                "value": null
            },
            "fields": []
        },
        "schedule": {
            "id": 1,
            "repeat": "monthly",
            "timestamp": "2020-08-21T14:07:54.000Z",
            "cron_string": "",
            "excludeTimestamps": [],
            "scheduled": true
        }
    }
];

// for setting id of each new ingestion
let idCount = ingestions.length + 1;
// variable for adding new data
let newData = {};
// key for local storage
const LOCAL_STORAGE_KEY = 'dmd_demo';
// current section index
let currentSectionIndex = 0;
// selected source location object with dependencies
let thisLoc = null;
// for schema fields table
let schemaFields = [
    {
        name: 'SSN',
        type: 'taxid',
        nnpi: 'true'
    },
    {
        name: 'DOB',
        type: 'date',
        nnpi: 'false'
    }
];

// Ingestion wizard sections
const sections = [
    {name:'description',desc:'Define Ingestion'},
    {name:'source_location',desc:'Select Source Location'},
    {name:'source_format',desc:'Select Source Format'},
    {name:'target',desc:'Select Target'},
    {name:'scheduling',desc:'Set Scheduling'}
    // {name:'complete',desc:'Ingestion Complete'}
];

// static list of tags user can choose from when describing the Ingestion
const tagOptions = [
    {
        name : 'a-code',
        value : 'apple'
    },
    {
        name : 'b-code',
        value : 'banana'
    },
    {
        name : 'c-code',
        value : 'cucumber'
    },
    {
        name : 'd-code',
        value : 'dandelion'
    },

];

// static list of source locations
const sourceLocations = [
    {
        name : 'S3',
        value : 's3',
        loc_dependencies : [
            {
                label : 'Project Folder',
                name : 'project_folder'
            },
            {
                label : 'Path to File',
                name : 'path_to_file'
            }
        ],
        format_dependencies : ['delimited', 'fixed', 'Parquet', 'XML', 'JSON']
    },
    {
        name : 'Database',
        value : 'db',
        loc_dependencies : [
            {
                label : 'Database  Schema',
                name : 'database_schema'
            },
            {
                label : 'Database Table',
                name : 'database_table'
            }
        ],
        format_dependencies : ['Relational', 'Relational XML', 'Relational JSON']
    }
];

const delimiterOptions =  ['comma', 'colon', 'tab'];

const encodingOptions = ['UTF8', 'UTF16', 'ascii'];

const schemaTypes = [
    {name:'Text', value:'text'},
    {name:'Currency', value:'currency'},
    {name:'Decimal', value:'decimal'}, 
    {name:'Date', value:'date'}, 
    {name:'Timestamp', value:'timestamp'}, 
    {name:'Tax ID', value:'taxid'}
];

const targetLocations = [
    {
        name : 'Enterprise Data Warehouse',
        value : 'edw'
    },
    {
        name : 'Data Lake',
        value : 'datalake'
    }
];

const frequencies = [
    {name:'Once', value:'once'},
    {name:'Hourly', value:'hourly'}, 
    {name:'Weekly', value:'weekly'},
    {name:'Monthly', value:'monthly'},
    {name:'Quarterly', value:'quarterly'},
    {name:'Yearly', value:'yearly'},
    {name:'Cron', value:'cron'},
    {name:'Run Now', value:'runnow'}
];

let thisIngestion = null;