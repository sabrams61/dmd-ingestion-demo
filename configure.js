// mock database for all ingestions
let ingestions = [
    {
        "id": 1,
        "pipeline": {
            "name": "Leads",
            "project_name": "Marketing",
            "sourceid": 1,
            "targetid": 1,
            "scheduleid": 1,
            "comments": "this is a default ingestion already included for testing purposes",
            "tags": ['alphta', 'beta']
        },
        "source": {
            "id": 1,
            "locationid": 1,
            "location": "s3",
            "locationAttributes": {},
            "delimiter": "comma",
            "formatid": "3",
            "format": "fixed",
            "encoding": "utf8",
            "userAction": {
                "id": null,
                "value": null
            },
            "schema_fields": [
                {
                    "id": 1,
                    "name": "SSN",
                    "type": "taxid",
                    "nnpi": "true"
                },
                {
                    "id" : 2,
                    "name": "DOB",
                    "type": "date",
                    "nnpi": "false"
                }
            ],
            "username" : "lastjedi",
            "password" : "skywalker"        },
        "target": {
            "id": 1,
            "locationid": 3,
            "location": "datalake",
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
// key for local storage
const LOCAL_STORAGE_KEY = 'dmd_demo';
// current section index
let currentSectionIndex = 0;
// current project names
let projectNames = [
    {name:'Marketing', value:'marketing'},
    {name:'Sales', value:'sales'},
    {name:'Life Insurance', value:'life_insurance'},
    {name:'Retirement Planning', value:'retirement_planning'},
    {name:'Investing', value:'investing'},
    {name:'General', value:'general'},
    {name:'Company', value:'company'}
];
// selected source location object with dependencies
let thisLoc = null;
// for schema fields table
let schemaFields = [
    {
        id : 1,
        name : '',
        type : '',
        nnpi : ''
    }
];
// let schemaFields = []
//     {
//         id: 1,
//         name: 'SSN',
//         type: 'taxid',
//         nnpi: 'true'
//     },
//     {
//         id: 2,
//         name: 'DOB',
//         type: 'date',
//         nnpi: 'false'
//     }
// ];
// for setting id of each new schema
let schemaCount = schemaFields.length + 1;

// Ingestion wizard sections
const sections = [
    {name:'names',desc:'Name Ingestion'},
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
        value : 'alpha'
    },
    {
        name : 'b-code',
        value : 'beta'
    },
    {
        name : 'c-code',
        value : 'chi'
    },
    {
        name : 'd-code',
        value : 'delta'
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
        format_dependencies : [
            {name:'Delimited', value:'delimited'}, 
            {name:'Fixed', value:'fixed'}, 
            {name:'Parquet', value:'parquet'},
            {name:'XML', value:'xml'},
            {name:'JSON', value:'json'}
        ]
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
        format_dependencies : [
            {name:'Relational', value:'relational'},
            {name:'Relational XML', value:'relational_xml'},
            {name:'Relational JSON', value:'relational_json'}
        ]
    }
];

const delimiterOptions =  [
    {name:'Comma', value:'comma'},
    {name:'Colon', value:'colon'}, 
    {name:'Tab', value:'tab'}
];

const encodingOptions = [
    {name:'UTF8', value:'utf8'},
    {name:'UTF16', value:'utf16'},
    {name:'ascii', value:'ascii'}
];

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