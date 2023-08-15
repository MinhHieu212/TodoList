function create_LiElement(todo , clone_template) {
    if(!todo) return;
    const Li_element = clone_template.content.firstElementChild.cloneNode(true);
    if(!Li_element) return;

    const title_item = Li_element.querySelector(".todo__item__title");
    title_item.textContent = todo.title;
    Li_element.dataset.id = todo.id;
    Li_element.dataset.status = todo.status;

    const status_current = Li_element.dataset.status; 
    Li_element.classList.add(status_current);

    const buttom_finish = Li_element.querySelector('.buttom__finish');
    if(buttom_finish) {
        buttom_finish.addEventListener('click' , () => {
            console.log("click of finish");
            const status_after = Li_element.dataset.status == 'success' ? 'pendding' : 'success';
            Li_element.dataset.status = status_after;
            Li_element.classList.remove('success' , 'pendding');
            Li_element.classList.add(status_after);
            
            // change status on local storage
            const index = todo.id;
            if(index < -1) return;
            const todolist = gettodolist('todolist');   
            todolist.find((x) => x.id == todo.id).status = status_after;

            localStorage.setItem('todolist' , JSON.stringify(todolist));
        })
    }

    const buttom_remove = Li_element.querySelector('.buttom__remove');
    if(buttom_remove) {
        buttom_remove.addEventListener('click' , () =>  {
            console.log("click of remove");

            // new todo list after remove
            const todolist = gettodolist('todolist');    
          
            if(Li_element.dataset.status == 'success') {
                const newtodolist = todolist.filter((x) => x.id != todo.id);
                console.log(newtodolist);
                
                localStorage.setItem('todolist' , JSON.stringify(newtodolist));
                Li_element.remove();
            }
            else alert("You need to do this right now !!");
        })
    }   

    const buttom_edit = Li_element.querySelector('.buttom__edit');
    if(buttom_edit) {
        buttom_edit.addEventListener('click' , () =>  {
            console.log("click of eidt");
            const todolist = gettodolist('todolist');
            const newtodo = todolist.find((x) => x.id == todo.id);
            if(!newtodo) return;
            populateFromtodo(newtodo);
        })
    }  

    return Li_element;
}

function populateFromtodo(todo) {
    const todoForm = document.getElementById('todoFormId');
    if(!todoForm) return;
    todoForm.dataset.id = todo.id;
    const textInput = document.getElementById('textId');
    if(textInput) textInput.value = todo.title; 
}

function gettodolist(name) {
    try {
        return JSON.parse(localStorage.getItem(name)) || [];
    } catch {
        return []
    }
}   

function renderTodolist(todolist , ul_id) {

    const UL_element = document.querySelector(ul_id);
    const Li_template = document.querySelector("#li__todolist__template");
    if(!Array.isArray(todolist) ||!UL_element || !Li_template) return null;
    for (const todo of todolist) {
        // console.log(todo);
        const Li_element = create_LiElement(todo , Li_template);
        UL_element.appendChild(Li_element);
    }
}

function handlerInputForm(event) {
    event.preventDefault();
    const textinput = document.getElementById('textId');
    if(!textinput) return false;

    if(textinput.value == '') return;

    const todoForm = document.getElementById('todoFormId');
    if(!todoForm) return;
    
    const isEdit = Boolean(todoForm.dataset.id);

    if(isEdit) {
        // edit text and store right here
        const todolist = gettodolist('todolist');
        todolist.find((x) => x.id.toString() == todoForm.dataset.id).title = textinput.value;
        
        localStorage.setItem('todolist' , JSON.stringify(todolist));    
        
        
        const Li_element = document.querySelector(`ul#todolist > li[data-id="${todoForm.dataset.id}"]`);
        if(Li_element) {
            const title_item = Li_element.querySelector(".todo__item__title");
            if(title_item) title_item.textContent = textinput.value;
        }
        
    } else  {
        // add a new to do item    
        const new_Li_element =  {id: Date.now() , title: textinput.value , status: 'pendding'};
        textinput.value = '';
        
        const todolist = gettodolist('todolist');
        todolist.push(new_Li_element);
        
        localStorage.setItem('todolist' , JSON.stringify(todolist));
        
        const Li_template = document.querySelector("#li__todolist__template");
        const New_Li_element = create_LiElement(new_Li_element , Li_template);   
        const UL_element = document.getElementById('todolist'); 
        if(!New_Li_element || !UL_element) return;
        
        UL_element.appendChild(New_Li_element);
    }

    delete todoForm.dataset.id;
    todoForm.reset();
}

function isMatch(Li_element , Search_item) {
    if(!Li_element) return false;
    if(Search_item == '') return true;

    const title = Li_element.querySelector('.todo__item__title');
    if(!title) return false;
    return title.textContent.toLowerCase().includes(Search_item.toLowerCase());
}

function searchtodo(value) {
    const liList = document.querySelectorAll('#todolist > li'); 
    for (const liItem of liList) {
        const Show = isMatch(liItem , value);
        if(!Show) liItem.classList.add('hiddening');
        else liItem.classList.remove('hiddening');
    }   

}


function intiSearchInput() {
    const searchInput = document.getElementById('searchid');
    if(!searchInput) return; 

    searchInput.addEventListener('input', (event) => {
        event.preventDefault(); 
        searchtodo(searchInput.value);
        handlerFilterChange('searchid', searchInput.value);    
    })   
}

function filterTodo(value) {
    const Li_list = document.querySelectorAll('#todolist > li');
    if(!Li_list) return;

    for (const liItem of Li_list) {
        const Show = value == 'all' || value == liItem.dataset.status;
        if(!Show) liItem.classList.add('hiddening');
        else liItem.classList.remove('hiddening');
    }
}

function intiFilterInput() {
    const filterInput = document.getElementById('todoSelect');
    if(!filterInput) return;
    
    filterInput.addEventListener('change' , () => {
       filterTodo(filterInput.value);
       handlerFilterChange('status', filterInput.value);
    })
}

function handlerFilterChange(filterName , filterValue) {
    const url = new URL(window.location);
    url.searchParams.set(filterName , filterValue);

    history.pushState({} , '' , url);
}

(() => {
    const todolist = gettodolist('todolist');
    renderTodolist(todolist , '#todolist');

    // get input value
    const inputForm = document.getElementById('todoFormId');
    if(!inputForm) return;

    intiSearchInput();
    intiFilterInput();

    inputForm.addEventListener('submit' , handlerInputForm);
})();