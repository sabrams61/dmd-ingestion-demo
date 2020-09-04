/**
 * filter through saved list of domain names on keydown
 */
const filterDomainOptions = (val) => {
    val = val.toLowerCase();
    $.each($('#domain-options .option'), function() {
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
const setDomain = (name) => {
    $('#section_names #domain').val(name);
    $('#domain-options').hide()
}

/**
 * after using enters ingestion name and/or project name, submits to  begin ingestion process
 * compares to list of all current ingestion to see if there's a match
 */
const initiateIngestion = () => {
    const projName = $('#section_names input#project_name').val();
    const dom = $('#section_names input#domain').val();
    const nameArea = $('#ingestion-names');
    if (projName || ingName) {
        nameArea.removeClass();
        nameArea.html('');
        nameArea.append($('<span>' + projName + '</span>'));
        nameArea.append($('<span>' + dom + '</span>'));
        $('#section_description').removeClass('new matched initiated');
        const match = ingestions.find((e) => { return e.pipeline.project_name === projName && e.pipeline.domain === dom; });
        if (match) {
            thisIngestion = JSON.parse(JSON.stringify(match));
            console.log('we found a match', thisIngestion);
            fillOutFormFromData();
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('matched');
        } else {
            clearFormData();
            thisIngestion.pipeline.project_name = projName;
            thisIngestion.pipeline.domain = dom;
            console.log('brand new ingestion', thisIngestion);
            $('#section_description').addClass('initiated');
            $('#section_description').addClass('new');
        }
        changeSection(1);
        nameArea.show();
    }
}
