// mock database for all ingestions
let ingestions = [
    {
        "id": 1,
        "pipeline": {
            "project_name": "Leads",
            "domain": "Marketing",
            "sourceid": 1,
            "targetid": 1,
            "scheduleid": 1,
            "owner_email": "sabrams61@massmutual.com",
            "comments": "this is a default ingestion already included for testing purposes",
            "tags": [
                {id:1,name:'T-Code',value:'8780BG'},
                {id:2,name:'G-Code',value:'43300'},
                {id:3,name:'IP Address',value:'123.456.90.65'},
                {id:4,name:'Connector',value:'G-7'},
                {id:5,name:'System',value:'Verizon'},
                {id:6,name:'Start Date',value:'08-23-19'}
            ]
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
                },
                {
                    "id": 3,
                    "name": "First Name",
                    "type": "text",
                    "nnpi": "false"
                },
                {
                    "id" : 4,
                    "name": "Last Name",
                    "type": "text",
                    "nnpi": "true"
                },
                {
                    "id": 5,
                    "name": "City",
                    "type": "text",
                    "nnpi": "false"
                },
                {
                    "id" : 6,
                    "name": "State",
                    "type": "text",
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
            "timestamp": "2020-09-11T11:10",
            "cron_string": "",
            "excludeTimestamps": [],
            "scheduled": true,
            "schedule_email": "bigbluff@massmutual.com"
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
// current domain names
let domainNames = [
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
let schemaFields = [];

// object to be used for creating new schema field
let editedSchemaField = {};
// set to either 'add' or 'edit'
let schemaEditMode = 'add';
// empty schema field
const emptySchemaField =  {
    name : '',
    type : '',
    nnpi : 'false',
    id : Math.floor(Math.random() * 1001)
};

// static list of tags user can choose from when describing the Ingestion
let tagOptions = [
    {
        id : 1,
        name : 'A-Code'
    },
    {
        id : 2,
        name : 'B-Code'
    },
    {
        id : 3,
        name : 'C-Code'
    },
    {
        id : 4,
        name : 'D-Code'
    },
    {
        id : 5,
        name : 'E-Code'
    },
    {
        id : 6,
        name : 'F-Code'
    },
    {
        id : 7,
        name : 'G-Code'
    },
    {
        id : 8,
        name : 'H-Code'
    },
    {
        id : 9,
        name : 'I-Code'
    },
    {
        id : 10,
        name : 'K-Code'
    },
    {
        id : 11,
        name : 'T-Code',
    }
];
// selected tags in this ingestion
let selectedTags = [];

// static list of source locations
const sourceLocations = [
    {
        id: 1,
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
            {id:1,name:'Delimited', value:'delimited'}, 
            {id:2,name:'Fixed', value:'fixed'}, 
            {id:3,name:'Parquet', value:'parquet'},
            {id:4,name:'XML', value:'xml'},
            {id:5,name:'JSON', value:'json'}
        ]
    },
    {
        id: 2,
        name : 'Database',
        value : 'db',
        loc_dependencies : [
            {
                id : 1,
                label : 'Database  Schema',
                name : 'database_schema'
            },
            {
                id : 2,
                label : 'Database Table',
                name : 'database_table'
            }
        ],
        format_dependencies : [
            {id:6,name:'Relational', value:'relational'},
            {id:7,name:'Relational XML', value:'relational_xml'},
            {id:8,name:'Relational JSON', value:'relational_json'}
        ]
    }
];

const delimiterOptions =  [
    {id:1,name:'Comma', value:'comma', example: ','},
    {id:2,name:'Colon', value:'colon', example: ':'}, 
    {id:3,name:'Tab', value:'tab', example: '&nbsp;&nbsp;&nbsp;&nbsp;'}
];

const encodingOptions = [
    {id:1,name:'UTF8', value:'utf8'},
    {id:2,name:'UTF16', value:'utf16'},
    {id:3,name:'ascii', value:'ascii'}
];

const schemaTypes = [
    {id:1,name:'Text', value:'text'},
    {id:2,name:'Currency', value:'currency'},
    {id:3,name:'Decimal', value:'decimal'}, 
    {id:4,name:'Date', value:'date'}, 
    {id:5,name:'Timestamp', value:'timestamp'}, 
    {id:6,name:'Tax ID', value:'taxid'}
];

const targetLocations = [
    {
        id : 1,
        name : 'Enterprise Data Warehouse',
        value : 'edw'
    },
    {
        id : 2,
        name : 'Data Lake',
        value : 'datalake'
    }
];

const frequencies = [
    {id:1,name:'Once', value:'once'},
    {id:2,name:'Hourly', value:'hourly'}, 
    {id:3,name:'Weekly', value:'weekly'},
    {id:4,name:'Monthly', value:'monthly'},
    {id:5,name:'Quarterly', value:'quarterly'},
    {id:6,name:'Yearly', value:'yearly'},
    {id:7,name:'Cron', value:'cron'},
    {id:8,name:'Run Now', value:'runnow'}
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
                    name: 'Domain',
                    field_key: 'domain',
                    type: 'text'
                },
                {
                    name: 'Ingestion Owner Email',
                    field_key: 'owner_email',
                    type: 'text'
                },
                {
                    name: 'Description',
                    field_key: 'comments',
                    type: 'text'
                },
                {
                    name: 'Tags',
                    field_key: 'tags',
                    type: 'object-array-mult-obj',
                    get_values_from: selectedTags,
                    properties: ['name', 'value']
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
                    type: 'object-array-mult-obj',
                    get_values_from: schemaFields,
                    properties: ['name']
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
                },
                {
                    name: 'Scheduling Confirmation Email',
                    field_key: 'schedule_email',
                    type: 'text'
                }
            ]
        }
    ]
};