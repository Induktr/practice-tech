function openModalArticles() {
    const dropDownMenu = document.createElement("div");
    
    dropDownMenu.setAttribute("class", "dropdown-nav");
    
    document.body.prepend(dropDownMenu);
};


function renderUi() {
    openModalArticles();
};

renderUi();