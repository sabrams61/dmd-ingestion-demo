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
 * build out a worksheet that reviews all the Ingestion data
 */
const buildReview = () => {
    const rev = $('#review_worksheet');
    rev.html('');
    reviewWorksheet.sections.map((section) => {
        let secName = $('<div class="section-name">' + section.name + '</div>');
        let dataSec = thisIngestion[section.section_key];
        rev.append(secName);
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
                case 'object-array-obj-mult':
                    console.log('field key, value', field.field_key, dataSec[field.field_key]);
                    let thisArr = dataSec[field.field_key];
                    console.log('thisArr', thisArr);
                    thisArr.map((obj) => {
                        let thisObj = $('<span class="val-obj"></span>');
                        field.properties.map((prop) => {
                            thisObj.append($('<span class="prop">' + obj[prop] + '</span>'));
                        }); 
                        fieldVal.append(thisObj);
                    });
                    break;
                default:
                    fieldVal.text('hello');
            }
            rev.append(fieldName);
            rev.append(fieldVal);
        });
    });
};