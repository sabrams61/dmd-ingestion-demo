/**
 * build the schema fields table
 */
const buildSchemaFields = () => {
    $('#selected-schema-fields').html('');
    thisIngestion.source.schema_fields.map((schema) => {
        let newTicket = $('<div class="schema-ticket" id="schema_ticket_' + schema.id + '"><span>' + schema.name + '</span> <i class="fas fa-edit" title="edit" onClick="editSchemaField(\'' + schema.id + '\', false)"></i> <i class="fas fa-times-circle" title="remove" onClick="deleteSchemaField(\'' + schema.id + '\', false)"></i></div>');
        $('#selected-schema-fields').append(newTicket);
        console.log('thisIngestion.source.schema_fields', thisIngestion.source.schema_fields);
    });
};

/**
 * add new schema field row in table
 */
const editSchemaField = (id) => {
    editedSchemaField = id ? thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) === parseInt(id); }) : {name:'',type:'',nnpi:'false',id:Math.floor(Math.random() * 1001)};
    schemaEditMode = id ? 'edit' : 'add';
    const schemaTable = $('#schema-table tbody tr');
    let options;
    schemaTable.html('');
    schemaTypes.map((type) => {
        options += '<option value="' + type.value + '">' + type.name + '</option>';
    });
    const types = (id) => {
        return '<select id="schema_type" name="schema_type" onChange="editedSchemaField.type = $(this).val()">' + options + '</select>';
    };
    const nnpi = (id) => {
        return '<select id="schema_nnpi" name="schema_nnpi" onChange="editedSchemaField.nnpi = $(this).val()"><option value="true">Yes</option><option value="false">No</option></select>';
    };
    let row = $('<td class="name"><input name="name" type="text" value="' + editedSchemaField.name + '" onBlur="editedSchemaField.name = $(this).val()" /></td>' +
                '<td class="type">' + types(editedSchemaField.id) + '</td>' + 
                '<td class="nnpi">' + nnpi(editedSchemaField.id) + '</td>' + 
                '<td class="actions"><i class="far fa-check-circle pointer green" onClick="updateSchemaFieldData(\'' + editedSchemaField.id + '\')" title="Done"></i> <i class="far fa-times-circle pointer dark-gray" onClick="cancelEditSchema()" title="Cancel"></i></td>');    
    schemaTable.append(row);
    $('#schema-table').show();
    $('.type select', schemaTable).val(editedSchemaField.type);
    $('.nnpi select', schemaTable).val(editedSchemaField.nnpi);
    console.log('this row type', $('.type select', schemaTable).val());
    console.log('this row nnpi', $('.nnpi select', schemaTable).val());
};

/**
 * delete existing schema field
 */
const deleteSchemaField = (id) => {
    console.log('schema to delete', id);
    thisIngestion.source.schema_fields = thisIngestion.source.schema_fields.filter((e) => { return parseInt(e.id) !== parseInt(id); });
    console.log('remaining schema fields', thisIngestion.source.schema_fields);
    schemaFields = thisIngestion.source.schema_fields;
    $('#selected-schema-fields #schema_ticket_' + id).remove();
};

/**
 * update the ingestion schema fields data of selected schema or add newly created one to list
 */
const updateSchemaFieldData = (id) => {
    if (schemaEditMode === 'add') {
        thisIngestion.source.schema_fields.push(editedSchemaField);
    } else {
        thisSchema = thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) !== parseInt(id); });
        thisSchema = {...thisSchema, editedSchemaField}
    }
    schemaFields = thisIngestion.source.schema_fields;
    buildSchemaFields();
    editedSchemaField = {};
    $('#schema-table').hide();
};

/**
 * cancel edits to schema field
 */
 const cancelEditSchema = () => {
    editedSchemaField = {};
    $('#schema-table').hide();
 }