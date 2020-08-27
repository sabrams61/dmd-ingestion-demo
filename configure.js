// mock database for all ingestions
let ingestions = [
    {
        "id": 1,
        "pipeline": {
            "name": "Leads",
            "project_name": "Marketing",
            "domain_name": "",
            "sourceid": 1,
            "targetid": 1,
            "scheduleid": 1,
            "comments": "this is a default ingestion already included for testing purposes",
            "tags": ['alpha', 'beta']
        },
        "source": {
            "id": 1,
            "locationid": 1,
            "location": "s3",
            "project_folder": "Q4",
            "path_to_file": "s3://marketing/leads/2019/quarters",
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

// Ingestion wizard sections
const sections = [
    {name:'names',desc:'Name Ingestion'},
    {name:'description',desc:'Describe Ingestion'},
    {name:'source_location',desc:'Select Source Location'},
    {name:'source_format',desc:'Select Source Format'},
    {name:'target',desc:'Select Target'},
    {name:'scheduling',desc:'Set Scheduling'},
    {name:'submit',desc:'Review and Submit'}
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

// static list of tags user can choose from when describing the Ingestion
const tagOptions = [
    {
        name : 'A-code',
        value : 'alpha'
    },
    {
        name : 'B-code',
        value : 'beta'
    },
    {
        name : 'C-code',
        value : 'chi'
    },
    {
        name : 'D-code',
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
    {name:'Comma', value:'comma', example: ','},
    {name:'Colon', value:'colon', example: ':'}, 
    {name:'Tab', value:'tab', example: '&nbsp;&nbsp;&nbsp;&nbsp;'}
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

// set up for review worksheet
const reviewWorksheet = {
    sections : [
        {
            name : 'Description',
            section_key : 'pipeline',
            fields : [
                {
                    name: 'Project Name',
                    field_key: 'project_name',
                    type: 'text'
                },
                {
                    name: 'Domain Name',
                    field_key: 'domain_name',
                    type: 'text'
                },
                {
                    name: 'Ingestion Name',
                    field_key: 'name',
                    type: 'text'
                },
                {
                    name: 'Tags',
                    field_key: 'tags',
                    type: 'object-array-mult',
                    get_values_from: tagOptions
                },
                {
                    name: 'Description',
                    field_key: 'comments',
                    type: 'text'
                }
            ]
        },
        {
            name : 'Source',
            section_key : 'source',
            fields : [
                {
                    name: 'Location',
                    field_key: 'location',
                    type: 'object-array',
                    get_values_from: sourceLocations
                },
                {
                    name: 'Project Folder',
                    field_key: 'project_folder',
                    type: 'text',
                    dependency_field: 'location',
                    dependency_value: 's3'
                },
                {
                    name: 'Path Folder',
                    field_key: 'path_to_file',
                    type: 'text',
                    dependency_field: 'location',
                    dependency_value: 's3'
                },
                {
                    name: 'Database Schema',
                    field_key: 'database_schema',
                    type: 'text',
                    dependency_field: 'location',
                    dependency_value: 'database'
                },
                {
                    name: 'Database Table',
                    field_key: 'database_table',
                    type: 'text',
                    dependency_field: 'location',
                    dependency_value: 'database'
                },
                {
                    name: 'Username',
                    field_key: 'username',
                    type: 'text'
                },
                {
                    name: 'Password',
                    field_key: 'password',
                    type: 'password'
                },
                {
                    name: 'Format Sample File',
                    field_key: 'sample_file',
                    type: 'text'
                },
                {
                    name: 'Format',
                    field_key: 'format',
                    type: 'text'
                },
                {
                    name: 'Delimiter',
                    field_key: 'delimiter',
                    type: 'object-array',
                    get_values_from: delimiterOptions
                },
                {
                    name: 'Encoding',
                    field_key: 'encoding',
                    type: 'object-array',
                    get_values_from: encodingOptions
                },
                {
                    name: 'Schema Fields',
                    field_key: 'schema_fields',
                    type: 'object-array-mult',
                    get_values_from: schemaFields
                },
            ]
        },
        {
            name : 'Target',
            section_key : 'target',
            fields : [
                {
                    name: 'Location',
                    field_key: 'location',
                    type: 'object-array',
                    get_values_from: targetLocations
                }
            ]
        },
        {
            name : 'Schedule',
            section_key : 'schedule',
            fields : [
                {
                    name: 'Frequency',
                    field_key: 'repeat',
                    type: 'object-array',
                    get_values_from: frequencies
                },
                {
                    name: 'Ingestion Date',
                    field_key: 'timestamp',
                    type: 'date'
                }
            ]
        }
    ]
};