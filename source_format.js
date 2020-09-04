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
 * add new schema field (no id passed in) or edit existing one (id passed in)
 */
const editSchemaField = (id) => {
    editedSchemaField = id ? thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) === parseInt(id); }) : emptySchemaField;
    updateSchemaClass(id ? 'edit' : 'add');
    $('#schema_name').val(editedSchemaField.name);
    $('#schema_type').val(editedSchemaField.type);
    $('#schema_nnpi').val(editedSchemaField.nnpi);
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
    if (!id) {
        thisIngestion.source.schema_fields.push(editedSchemaField);
    } else {
        thisSchema = thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) !== parseInt(id); });
        thisSchema = {...thisSchema, editedSchemaField}
    }
    schemaFields = thisIngestion.source.schema_fields;
    buildSchemaFields();
    clearSchemaInputs();
};

/**
 * cancel edits to schema and clear input fields
 */
 const clearSchemaInputs = () => {
    $('#schema_name').val('');
    $('#schema_type').val('');
    $('#schema_nnpi').val('');
    updateSchemaClass('add')
 };

 // update CSS class around edit schema fields
 const updateSchemaClass = (status) => {
    console.log('status', status);
    const edSc = $('#edit-schema');
    if (status === 'edit') {
        edSc.removeClass('add').addClass('edit');
    } else {
        edSc.removeClass('edit').addClass('add');
    }
 };