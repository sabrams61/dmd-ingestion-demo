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
