/**
 * get url parameter
 * @param {} sParam 
 */
const getUrlParameter = (sParam) => {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

// thisIngestion
let thisIngestion;
// status of thisIngestion
let ingestionStatus = 'edit'

/**
 * pull up saved data from local storage
 * if section param in url, go directly to that section
 */
const init = () => {
    resetThisIngestion();
    const thisSection = getUrlParameter('section');
    if (thisSection) {
        for (let n = 0; n < sections.length; n++) {
            if (sections[n].name === thisSection) {
                return changeSection(null, n);
            }
        }
    }
};

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
 * clear all form inputs and reset thisIngestion
 */
const clearFormData = () => {
    $('input[type="text"]').val('');
    $('input[type="email"]').val('');
    $('input[type="password"]').val('');
    $('input[type="datetime-local"]').val('');
    $('select').val('');
    $('textarea').val('');
    $('input[type="checkbox"]').prop('checked', false);
    $('input[type="radio"]').prop('checked', false);
    allTags = allTags.concat(selectedTags);
    selectedTags = [];
    buildTagsChoiceList();
    schemaFields = [{
        id : 1,
        name : '',
        type : '',
        nnpi : ''
    }];
    $('#schema-table tbody').html('');
    showUnPw(false);
    $('#loc-dependencies').html('');
    $('#format-options-box').html('');
    $('#section_source_format .sample-upload p span').text('');
    resetThisIngestion();
}

/**
 * delete local storage
 */
const deleteLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
};

const applyLocalStorage = () => {
    thisIngestion = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log('saved data', thisIngestion);
    if (thisIngestion) {
        fillOutFormFromData();
    }
}

/**
 * filter through saved list of project names on keydown
 */
const filterProjectOptions = (val) => {
    val = val.toLowerCase();
    $.each($('#project-options .option'), function() {
        let p = $(this).text().toLowerCase();
        // console.log('typed val, this val', val, p);
        if (p.includes(val)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
};

/**
 * set project name from selected option in list and hide list
 */
const setProjectName = (name) => {
    $('#section_names #project_name').val(name);
    $('#project-options').hide()
}

/**
 * after using enters ingestion name and/or project name, submits to  begin ingestion process
 * compares to list of all current ingestion to see if there's a match
 */
const initiateIngestion = () => {
    const projName = $('#section_names input#project_name').val();
    const domName = $('#section_names input#domain_name').val();
    const ingName = $('#section_names input#name').val();
    const nameArea = $('#ingestion-names');
    if (projName || ingName) {
        nameArea.removeClass();
        nameArea.html('');
        nameArea.append($('<span>' + projName + '</span>'));
        if (domName) {
            nameArea.append($('<span>' + domName + '</span>'));
        }
        nameArea.append($('<span>' + ingName + '</span>'));
        $('#section_description').removeClass('new matched initiated');
        const match = ingestions.find((e) => { return e.pipeline.project_name === projName && e.pipeline.domain_name === domName && e.pipeline.name === ingName; });
        if (match) {
            thisIngestion = JSON.parse(JSON.stringify(match));
            console.log('we found a match', thisIngestion);
            fillOutFormFromData();
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('matched');
        } else {
            clearFormData();
            thisIngestion.pipeline.project_name = projName;
            thisIngestion.pipeline.domain_name = domName;
            thisIngestion.pipeline.name = ingName;
            console.log('brand new ingestion', thisIngestion);
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('new');
        }
        changeSection(1);
        nameArea.show();
    }
}

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
    if (newSection === 'submit') {
        buildReview();
    }
    $('sections section').removeClass('active');
    $('#section_' + newSection).addClass('active');
    $('.breadcrumb li').show().removeClass('active');
    $('.breadcrumb li.' + newSection).addClass('active');
    window.scrollTo(0, 0);
}

/**
 * fill out form inputs from thisIngestion data
 */
const fillOutFormFromData = () => {
    // names
    $('#section_names #project_name').val(thisIngestion.pipeline.project_name);
    $('#section_names #domain_name').val(thisIngestion.pipeline.domain_name);
    $('#section_names #name').val(thisIngestion.pipeline.name);
    // description
    if (!!thisIngestion.pipeline.tags) {
        thisIngestion.pipeline.tags.map((tagVal) => {
            updateTags(tagVal, true, true);
        });
    }
    buildTagsChoiceList();
    $('#section_description #comments').val(thisIngestion.pipeline.comments);
    $('#section_description #owner_email').val(thisIngestion.pipeline.owner_email);
    // source location
    if (thisIngestion.source.location) {
        thisLoc = sourceLocations.find((e) => { return e.value === thisIngestion.source.location });
        $('#loc-options-box #chk_' + thisIngestion.source.location).prop('checked', true);
        showLocDependencies();
        thisLoc.loc_dependencies.map((d) => {
            $('#loc-dependencies #' + d.name).val(thisIngestion.source[d.name]);
        });
        $('#section_source_location #source_username').val(thisIngestion.source.username);
        $('#section_source_location #source_password').val(thisIngestion.source.password);
        if (thisIngestion.source.username) {
            showUnPw(true);
            $('#section_source_location #needs_un_pw').prop('checked', true);
        }
        showFormatDependencies();
    }
    // source format
    $('#section_source_format #format-options-box #chk_' + thisIngestion.source.format).prop('checked', true);
    $('#section_source_format #delimiters #chk_' + thisIngestion.source.delimiter).prop('checked', true);
    $('#section_source_format #encoding #chk_' + thisIngestion.source.encoding).prop('checked', true);
    if (!!thisIngestion.source.schema_fields) {
        schemaFields = thisIngestion.source.schema_fields;
    }
    buildSchemaFields();
    $('#section_source_format .sample-upload p span').text(thisIngestion.source.sample_file);
    // target
    $('#section_target #target-options-box #chk_' + thisIngestion.target.location).prop('checked', true);
    // scheduling
    $('#section_scheduling #frequencies #chk_' + thisIngestion.schedule.repeat).prop('checked', true);
    $('#section_scheduling #date-time').val(thisIngestion.schedule.timestamp);
    $('#section_scheduling #schedule_email').val(thisIngestion.schedule.schedule_email);
};

/**
 * update tags in thisIngestion
 * @{id} id of the tag
 * @{selected} true if selected, false if removed
 * @{ignoreThisIngestion} if true, don't update thisIngestion
 */
const updateTags = (id, selected, ignoreThisIngestion) => {
    console.log('id, selected, ignoreThisIngestion', id, selected, ignoreThisIngestion);
    if (selected) {
        let newTag = availableTags.find((e) => { return e.id == id; });
        console.log('newTag', newTag);
        let newTicket = $('<div class="tag-ticket" id="tag_ticket_' + id + '"><span>' + newTag.name + ' [' + newTag.value + ']</span> <i class="far fa-times-circle red" title="Remove" onClick="updateTags(\'' + newTag.id + '\', false)"></i></div>');
        $('#selected-tags').append(newTicket);
        availableTags = availableTags.filter((e) => { return e.id != id; });
        selectedTags.push(newTag);
        if (!ignoreThisIngestion) {
            thisIngestion.pipeline.tags.push(parseInt(id));
        }
        console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
        buildTagsChoiceList();
    } else {
        let oldTag = selectedTags.find((e) => { return e.id == id; });
        availableTags.push(oldTag);
        $('#tag_ticket_' + id).remove();
        buildTagsChoiceList();
        thisIngestion.pipeline.tags = thisIngestion.pipeline.tags.filter((e) => { return e != id; });
        console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
    }
};

const buildTagsChoiceList = () => {
    const tagChoices = $('#tag-choices');
    tagChoices.html('');
    availableTags.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    availableTags.map((option) => {
        let opt = $('<option value="' + option.id + '">' + option.name + ' [' + option.value + ']</option>');
        tagChoices.append(opt);
    });
}

/**
 * add a new tag to options list and select it
 */
const addNewTag = () => {
    let tn = $('#add-tag-name');
    let tv = $('#add-tag-value');
    const newTag = {
        id : Math.floor(Math.random() * 1001),
        name : tn.val(),
        value: tv.val()
    };
    tagOptions.push(newTag);
    updateTags(newTag.id, true);
    tn.val('');
    tv.val('');
};

/**
 * when a user selects a location, saves location to ingestion
 * determines lists of dependent location and format options
 */
const showLocDependencies = (loc) => {
    if (loc) {
        thisIngestion.source.location = loc;
        thisLoc = sourceLocations.find((e) => { return e.value === loc; });
    }
    let locInp = $('#loc-dependencies');
    let formatInp = $('#format-options-box');
    locInp.html('');
    formatInp.html('');
    thisLoc.loc_dependencies.map((d) => {
        let inp = $('<div class="form-group"><label>' + d.label + '</label><input type="text" id="' + d.name + '" name="' + d.name + '" onBlur="thisIngestion.source[\'' + d.name + '\'] = this.value" /></div>');
        locInp.append(inp);
    });
    thisLoc.format_dependencies.map((d) => {
        const opt = $('<div class="list-item"><input id="chk_' + d.value + '" name="loc-options" class="loc-option" type="radio" value="' + d.value + '" onClick="showFormatDependencies(\'' + d.value + '\')" /><label class="side-label" for="chk_' + d.value + '">' + d.name + '</label></div>');
        formatInp.append(opt);
    });
}

/**
 * if source format is 'delimited' than show delimiter options
 */
const showFormatDependencies = (opt) => {
    if (opt) {
        thisIngestion.source.format = opt;
    }
    const delimiterOptions = $('.form-group.delimiters');
    if (thisIngestion.source.format === 'delimited') {
        delimiterOptions.show();
        if (thisIngestion.source.delimiter) {
            $('#chk_' + thisIngestion.source.delimiter).prop('checked', true);
        }
    } else {
        thisIngestion.source.delimiter = null;
        delimiterOptions.hide();
    }
};

/**
 * show or hide the username and password fields for source location
 * @param {*} bool true means show username and password fields
 */
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
 * allow user to view password
 */
const showPw = () => {
    const inp = $('#source_password');
    const type = inp.prop('type');
    $('#source_password').prop('type', type === 'password' ? 'text' : 'password');
};

/**
 * build the schema fields table
 */
const buildSchemaFields = () => {
    $('#selected-schema-fields').html('');
    thisIngestion.source.schema_fields.map((schema) => {
        let newTicket = $('<div class="schema-ticket" id="schema_ticket_' + schema.id + '"><span>' + schema.name + '</span> <i class="fas fa-edit" title="edit" onClick="editSchemaField(\'' + schema.id + '\', false)"></i> <i class="far fa-times-circle red" title="remove" onClick="deleteSchemaField(\'' + schema.id + '\', false)"></i></div>');
        $('#selected-schema-fields').append(newTicket);
        console.log('thisIngestion.source.schema_fields', thisIngestion.source.schema_fields);
    });
};

/**
 * add new schema field row in table
 */
const editSchemaField = (id) => {
    editedSchemaField = id ? thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) === parseInt(id); }) : {name:'',type:'',nnpi:'false',id:Math.floor(Math.random() * 1001)};
    schemaEditType = id ? 'edit' : 'add';
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
    $('#selected-schema-fields #schema_ticket_' + id).remove();
};

/**
 * update the ingestion schema fields data of selected schema or add newly created one to list
 */
const updateSchemaFieldData = (id) => {
    if (schemaEditType === 'add') {
        thisIngestion.source.schema_fields.push(editedSchemaField);
    } else {
        thisSchema = thisIngestion.source.schema_fields.find((e) => { return parseInt(e.id) !== parseInt(id); });
        thisSchema = {...thisSchema, editedSchemaField}
    }
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

const showText = (section, field) => {
    return thisIngestion[section][field];
};

const buildReview = () => {
    const rev = $('#review_worksheet');
    rev.html('');
    reviewWorksheet.sections.map((section) => {
        // let secGroup = $('<div class="review-section" id="review_' + section.section_key + '"><div class="section-name">' + section.name + '</div><div class="section-fields"></div></div>');
        let secName = $('<div class="section-name">' + section.name + '</div>');
        let dataSec = thisIngestion[section.section_key];
        // console.log('dataSec', secGroup);
        //rev.append(secGroup);
        rev.append(secName);
        // let theseFields = $('#review_' + section.section_key + ' .section-fields');
        section.fields.map((field) => {
            let fieldName = $('<div class="label">' + field.name + '</div>');
            let fieldVal = $('<div class="value"></div>');            
            switch (field.type) {
                case 'text':
                    fieldVal.text(dataSec[field.field_key]);
                    break;
                case 'password':
                    fieldVal.text(dataSec[field.field_key].replace(/./g, '*'));
                    break;
                case 'date':
                    let thisDate = new Date(dataSec[field.field_key]);
                    let date = thisDate.getFullYear()+'-'+(thisDate.getMonth()+1)+'-'+thisDate.getDate();
                    let time = thisDate.getHours() + ":" + thisDate.getMinutes() + ":" + thisDate.getSeconds();
                    let dateTime = date+' '+time;
                    fieldVal.text(dateTime);
                    break;
                case 'object-array':
                    console.log('field key, value', field.field_key, dataSec[field.field_key]);
                    let thisObj = field.get_values_from.find((e) => { return e.value === dataSec[field.field_key]; });
                    if (thisObj) {
                        fieldVal.text(thisObj.name);
                    }
                    break;
                default:
                    fieldVal.text('hello');
            }
            // theseFields.append(fieldName);
            // theseFields.append(fieldVal);
            rev.append(fieldName);
            rev.append(fieldVal);
        });
    });
};

/**
 * complete ingestion scheduling
 */
const completeIngestion = () => {
    ingestionStatus = 'complete';
    const areaNames = $('#ingestion-names');
    let comMsg = 'Your ingestion ( ';
    if (thisIngestion.pipeline.name) {
        comMsg += '<span>' + thisIngestion.pipeline.name + '</span>';
    }
    if (thisIngestion.pipeline.project_name) {
        comMsg += '<span>' + thisIngestion.pipeline.project_name + '</span>';
    }
    comMsg += ' ) has successfully been scheduled.';
    areaNames.addClass('complete').html(comMsg);
    clearFormData();
    changeSection(null, 0);
    $('.breadcrumb li:not(.names)').hide();
};