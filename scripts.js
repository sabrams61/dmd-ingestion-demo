/**
 * delete local storage
 */
const deleteLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
};

/**
 * switch to a different section, either forward or backward, or directly to specific section
 * @param {direction} integer 1 or -1 to move to previous or next section
 * @param {goto} integer of direct section to go to
 */
const changeSection = (direction, goto) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(thisIngestion));
    console.log('current ingestion from ' + sections[currentSectionIndex].name, thisIngestion);
    currentSectionIndex = direction ? currentSectionIndex + direction : goto;
    let newSection = sections[currentSectionIndex].name;
    $('sections section').removeClass('active');
    $('#section_' + newSection).addClass('active');
    $('.breadcrumb li').show().removeClass('active');
    $('.breadcrumb li.' + newSection).addClass('active');
    window.scrollTo(0, 0);
}

/**
 * empty out thisIngestion
 */
const resetThisIngestion = () => {
    thisIngestion = {
        id : idCount,
        pipeline : {},
        source : {},
        target : {},
        schedule : {}
    }
}

/**
 * pull up saved data from local storage
 */
const init = () => {
    thisIngestion = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log('saved data', thisIngestion);
    if (thisIngestion) {
        fillOutFormFromData();
    } else {
        resetThisIngestion();
    }
};

/**
 * after using enters ingestion name and/or project name, submits to  begin ingestion process
 * compares to list of all current ingestion to see if there's a match
 */
const initiateIngestion = () => {
    const ingName = $('#section_description input#name').val();
    const projName = $('#section_description input#project_name').val();
    if (ingName || projName) {
        $('#section_description').removeClass('new matched initiated');
        const match = ingestions.find((e) => { return e.pipeline.name === ingName && e.pipeline.project_name === projName; });
        if (match) {
            thisIngestion = JSON.parse(JSON.stringify(match));
            console.log('we found a match', thisIngestion);
            fillOutTagsCommentsFromData();
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('matched');
        } else {
            console.log('brand new ingestion');
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('new');
            $('#section_description input#name').prop('disabled', true);
            $('#section_description input#project_name').prop('disabled', true);
        }
    }
}

const resubmitInitialIngestion = () => {
    resetThisIngestion();
    $('#tag-options-box input').prop('checked', false);
    $('#section_description #comments').val('');
    initiateIngestion();
}

/**
 * fill out form inputs for only tags and comments
 */
const fillOutTagsCommentsFromData = () => {
    // description
    if (!!thisIngestion.pipeline.tags) {
        thisIngestion.pipeline.tags.map((tag) => {
            $('#tag-options-box #chk_' + tag).prop('checked', true);
        });
    }
    $('#section_description #comments').val(thisIngestion.pipeline.comments);
};

/**
 * fill out form inputs from thisIngestion data
 */
const fillOutFormFromData = () => {
    // description
    $('#section_description input#name').val(thisIngestion.pipeline.name);
    $('#section_description input#project_name').val(thisIngestion.pipeline.project_name);
    if (!!thisIngestion.pipeline.tags) {
        thisIngestion.pipeline.tags.map((tag) => {
            $('#tag-options-box #chk_' + tag).prop('checked', true);
        });
    }
    $('#section_description #comments').val(thisIngestion.pipeline.comments);
    // source location
    if (thisIngestion.source.source_location) {
        thisLoc = sourceLocations.find((e) => { return e.value === thisIngestion.source.source_location });
        $('#loc-options-box #chk_' + thisIngestion.source.source_location).prop('checked', true);
        showLocDependencies();
        thisLoc.loc_dependencies.map((d) => {
            $('#loc-dependencies #' + d.name).val(thisIngestion.source[d.name]);
        });
        $('#section_source_location #source_username').val(thisIngestion.source.source_username);
        $('#section_source_location #source_password').val(thisIngestion.source.source_password);
        if (thisIngestion.source.source_username) {
            showUnPw(true);
            $('#section_source_location #needs_un_pw').prop('checked', true);
        }
        showFormatDependencies();
    }
    // source format
    if (thisIngestion.schema_fields) {
        schemaFields = thisIngestion.source.schema_fields;
    }
    buildSchemaFields();
};

/**
 * function to define ingestion
 * requires tags and comments
 */
const defineIngestion = (formData, direction) => {
    console.log('description form', formData);
    const selectedTags = [];
    for (let i = 0; i < formData.tags.length; i++) {
        selectedTags.push(formData.tags[i].value);
    };
    newData = {
        tags: selectedTags,
        comments : formData.comments
    }
    thisIngestion = {...thisIngestion, ...newData};
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(thisIngestion));
    console.log('defined ingestion', thisIngestion);
    changeSection(direction);
};

/**
 * update tags in thisIngestion
 * @param {*} options 
 */
const updateTags = () => {
    const selectedTags = [];
    $.each($('input[name="tag-options"]:checked'), function() {
        selectedTags.push($(this).val());
    });
    console.log('list of selected tags', selectedTags);
    thisIngestion.pipeline.tags = selectedTags;
};

/**
 * when a user selects a location, saves location to ingestion
 * determines lists of dependent location and format options
 */
const showLocDependencies = (loc) => {
    if (loc) {
        thisIngestion.source.source_location = loc;
        thisLoc = sourceLocations.find((e) => { return e.value === loc; });
    }
    let locInp = $('#loc-dependencies .form-groups');
    let formatInp = $('#format-options-box');
    locInp.html('');
    formatInp.html('');
    thisLoc.loc_dependencies.map((d) => {
        let inp = $('<div class="form-group"><label>' + d.label + '</label><input type="text" id="' + d.name + '" name="' + d.name + '" onBlur="thisIngestion.source[\'' + d.name + '\'] = this.value" /></div>');
        locInp.append(inp);
    });
    thisLoc.format_dependencies.map((d) => {
        const opt = $('<div class="list-item"><input id="chk_' + d + '" name="loc-options" class="loc-option" type="radio" value="' + d + '" onClick="showFormatDependencies(\'' + d + '\')" /><label class="side-label" for="chk_' + d + '">' + d + '</label></div>');
        formatInp.append(opt);
    });
}

/**
 * function to enter source location criteria
 * requires location and dependent inputs
 */
const enterSourceLocation = (formData, direction) => {
    console.log('source location form', formData);
    newData = {source_location : formData.location};
    formData.dependencies.map((d) => {
        newData[d.name] = d.value;
    });
    for (let i = 0; i < formData.dependencies.length; i++) {
        if (!!formData.dependencies[i].value) {
            newData[formData.dependencies[i].name] = formData.dependencies[i].value;
        }
    };
    thisIngestion = {...thisIngestion, ...newData};
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(thisIngestion));
    console.log('source location ingestion', thisIngestion);
    changeSection(direction);
};

/**
 * if source format is 'delimited' than show delimiter options
 */
const showFormatDependencies = (opt) => {
    if (opt) {
        thisIngestion.source_format = opt;
    }
    const delimiterOptions = $('#delimiters');
    if (thisIngestion.source_format === 'delimited') {
        delimiterOptions.show();
        if (thisIngestion.format_delimiter) {
            $('#chk_' + thisIngestion.format_delimiter).prop('checked', true);
        }
    } else {
        thisIngestion.format_delimiter = null;
        delimiterOptions.hide();
    }
};

const showUnPw = (bool) => {
    const sl = $('#section_source_location');
    if (bool) {
        sl.addClass('secured');
    } else {
        sl.removeClass('secured');
        thisIngestion.source.username = '';
        thisIngestion.source.password = '';
    }
}

/**
 * build the schema fields table
 */
const buildSchemaFields = () => {
    const schemaTable = $('#schema-table tbody');
    let options;
    schemaTable.html('');
    schemaTypes.map((type) => {
        options += '<option value="' + type.value + '">' + type.name + '</option>';
    });
    const types = '<select name="type" onBlur="updateSchemaFieldData()">' + options + '</select>';
    const nnpi = '<select name="nnpi" onBlur="updateSchemaFieldData()"><option value="true">Yes</option><option value="false">No</option></select>';
    schemaFields.map((schema) => {
        let row = $('<tr><td class="name"><input type="text" value="' + schema.name + '" onBlur="updateSchemaFieldData()" /></td><td class="type">' + types + '</td><td class="nnpi">' + nnpi + '</td><td class="actions"><i class="fas fa-trash-alt pointer " onClick="deleteSchemaField(\'' + schema.name + '\')"></i></td></tr>');
        $('.type select', row).val(schema.type);
        $('.nnpi select', row).val(schema.nnpi);
        // console.log('this row type', $('.type select', row).val());
        // console.log('this row nnpi', $('.nnpi select', row).val());
        schemaTable.append(row);
    });
};

/**
 * add new schema field row in table
 */
const addSchemaField = () => {
    let newField = {name:'',type:'',nnpi:'false'};
    schemaFields.push(newField);
    buildSchemaFields();
};

/**
 * delete existing schema field
 */
const deleteSchemaField = (fieldName) => {
    console.log('schema to delete', fieldName);
    schemaFields = schemaFields.filter((e) => { return e.name !== fieldName; });
    updateSchemaFieldData();
    buildSchemaFields();
};

/**
 * update the ingestion schema fields data
 */
const updateSchemaFieldData = () => {
    thisIngestion.schema_fields = schemaFields;
};