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
        pipeline : {tags:[]},
        source : {schema_fields:[]},
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
    selectedTags = [];
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
    $('#section_names #domain').val(thisIngestion.pipeline.domain);
    // description
    if (!!thisIngestion.pipeline.tags) {
        thisIngestion.pipeline.tags.map((tag) => {
            updateTags(tag, true);
        });
    }
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
    let thisCnt = 0;
    rev.html('');
    reviewWorksheet.sections.map((section, secCnt) => {
        let secName = $('<div id="section-' + (secCnt + 1) + '" class="section-name">' + section.name + '</div>');
        let dataSec = thisIngestion[section.section_key];
        rev.append(secName);
        section.fields.map((field, fieldCnt) => {
            const unFieldName = field.name.replace(/ /g, '_').toLowerCase();
            const fieldName = $('<div class="label" id="review_label_' + unFieldName + '">' + field.name + '</div>');
            const fieldVal = $('<div class="value" id="review_value_' + unFieldName + '"></div>');
            const maxArrLen = 5; // maximum number of array values to show initially 
            if (section.fields.length === fieldCnt + 1) {
                fieldName.addClass('last-field');
                fieldVal.addClass('last-field');
            }
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
                case 'object-array-mult-id':
                    console.log('field key, value', field.field_key, dataSec[field.field_key]);
                    let thisArr = dataSec[field.field_key];
                    thisArr.map((id) => {
                        let thisObj = field.get_values_from.find((e) => { return e.id === id; });
                        let thisItem = $('<span class="val-obj"></span>');
                        field.properties.map((prop) => {
                            thisItem.append($('<span class="prop">' + thisObj[prop] + '</span>'));
                        });
                        if (valCnt >= maxArrLen) {
                            thisItem.addClass('extra');
                        }
                        fieldVal.append(thisItem);
                    });
                    if (thisArr.length > maxArrLen) {
                        fieldVal.append($('<button class="i-button" onClick="showAllValues(\'' + unFieldName + '\')" title="Show All Values"><i class="fas fa-plus"></i> ' + (thisArrObj.length - maxArrLen) + '</button>'));
                        fieldVal.append($('<button class="i-button hide" onClick="showAllValues(\'' + unFieldName + '\')" title="Shrink Values"><i class="fas fa-angle-left"></i> Shrink</button>'));
                    }
                    break;
                case 'object-array-mult-obj':
                    console.log('field key, value', field.field_key, dataSec[field.field_key]);
                    let thisArrObj = dataSec[field.field_key];
                    console.log('thisArrObj', thisArrObj);
                    thisArrObj.map((obj, valCnt) => {
                        let thisItem = $('<span class="val-obj"></span>');
                        field.properties.map((prop) => {
                            thisItem.append($('<span class="prop">' + obj[prop] + '</span>'));
                        }); 
                        if (valCnt >= maxArrLen) {
                            thisItem.addClass('extra');
                        }
                        fieldVal.append(thisItem);
                    });
                    if (thisArrObj.length > maxArrLen) {
                        fieldVal.append($('<button class="i-button show" onClick="showAllValues(\'' + unFieldName + '\')" title="Show All Values"><i class="fas fa-plus"></i> ' + (thisArrObj.length - maxArrLen) + '</button>'));
                        fieldVal.append($('<button class="i-button hide" onClick="showAllValues(\'' + unFieldName + '\')" title="Shrink Values"><i class="fas fa-angle-left"></i> Shrink</button>'));
                    }
                    break;
                default:
                    fieldVal.text('hello');
            }
            rev.append(fieldName);
            rev.append(fieldVal);
        });
    });
};