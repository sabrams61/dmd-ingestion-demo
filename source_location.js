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