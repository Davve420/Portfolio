const todoList = []

function addToList(item){
    if(!item) return;
    todoList.push(item)
    render()
    return todoList
}

function addToTopOfList(item){
    if(!item) return;
    todoList.unshift(item);
    render()
    return todoList;
}

function removeFromBottomOfList(){
    const removed = todoList.pop();
    render()
    return removed;
}

function removeFromTopOfList(){
    const removed = todoList.shift();
    render()
    return removed;
}

function removeFromListByIndex(index){
    if(typeof index !== 'number' || index < 0 || index >= todoList.length){
        console.log("Only enter numbers within the list range (0..length-1).");
        return;
    }
    const removed = todoList.splice(index, 1)[0];
    render()
    return removed;
}

function removeFromListByName(name){
   const index = todoList.indexOf(name);
    if(index >= 0){
       const removed = todoList.splice(index, 1)[0];
       render()
       return removed;
    }
    return;
}

// ny funktion: ta bort från doneList
function removeFromDoneByName(name){
    const index = doneList.indexOf(name);
    if(index >= 0){
        const removed = doneList.splice(index, 1)[0];
        render();
        return removed;
    }
    return;
}

const doneList = [];

function removeFromListAndAddToDone(name){
    const index = todoList.indexOf(name);
    if(index < 0) return;
    const removedItem = todoList.splice(index, 1)[0];
    doneList.push(removedItem);
    render()
    return doneList;
}

function moveToTop(name){
    const index = todoList.indexOf(name);
    if(index < 0) return;
    const removedItem = todoList.splice(index, 1)[0];
    todoList.unshift(removedItem);
    render()
    return todoList;
}

function moveToBottom(name){
    const index = todoList.indexOf(name);
    if(index < 0) return;
    const removedItem = todoList.splice(index, 1)[0];
    todoList.push(removedItem);
    render()
    return todoList;
}

function moveDown(name){
    const index = todoList.indexOf(name);
    if(index < 0 || index === todoList.length - 1) return;
    const item = todoList.splice(index, 1)[0];
    todoList.splice(index + 1, 0, item);
    render()
}

function moveUp(name){
    const index = todoList.indexOf(name);
    if(index <= 0) return;
    const item = todoList.splice(index, 1)[0];
    todoList.splice(index - 1, 0, item);
    render()
}

/* --- DOM / rendering och event-delegation --- */

function createActionButton(text, action, name){
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.dataset.action = action;
    btn.dataset.name = name;
    return btn;
}

function render(){
    const todoUl = document.getElementById('todoUl');
    const doneUl = document.getElementById('doneUl');
    if(!todoUl || !doneUl) return;

    // Todo list
    todoUl.innerHTML = '';
    todoList.forEach((item, idx) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item;
        const actions = document.createElement('div');
        actions.className = 'actions';

        actions.appendChild(createActionButton('Top', 'moveTop', item));
        actions.appendChild(createActionButton('Up', 'moveUp', item));
        actions.appendChild(createActionButton('Down', 'moveDown', item));
        actions.appendChild(createActionButton('Bottom', 'moveBottom', item));
        actions.appendChild(createActionButton('Done', 'done', item));
        actions.appendChild(createActionButton('Remove', 'remove', item));

        li.appendChild(span);
        li.appendChild(actions);
        todoUl.appendChild(li);
    });

    // Done list
    doneUl.innerHTML = '';
    doneList.forEach(item => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item;
        const actions = document.createElement('div');
        actions.className = 'actions';

        // Lägg till remove-knapp för done-listan
        actions.appendChild(createActionButton('Remove', 'removeDone', item));

        li.appendChild(span);
        li.appendChild(actions);
        doneUl.appendChild(li);
    });

    // save current state to localStorage so the list persists
    try{
        const state = { todo: todoList, done: doneList };
        localStorage.setItem('todoAppState', JSON.stringify(state));
    }catch(err){
        // ignore storage errors (e.g., quota)
        console.warn('Could not save todo state:', err);
    }
}

/* Event listeners för UI-knappar */
document.addEventListener('DOMContentLoaded', () => {
    // load saved state from localStorage (if any)
    try{
        const raw = localStorage.getItem('todoAppState');
        if(raw){
            const parsed = JSON.parse(raw);
            if(Array.isArray(parsed.todo)){
                // clear and push to preserve reference
                todoList.length = 0;
                parsed.todo.forEach(i => todoList.push(i));
            }
            if(Array.isArray(parsed.done)){
                doneList.length = 0;
                parsed.done.forEach(i => doneList.push(i));
            }
        }
    }catch(err){
        console.warn('Could not load saved todo state:', err);
    }

    const addBottomBtn = document.getElementById('addBottomBtn');
    const addTopBtn = document.getElementById('addTopBtn');
    const newItemInput = document.getElementById('newItem');
    const todoUl = document.getElementById('todoUl');
    const doneUl = document.getElementById('doneUl'); // lägg till referens till doneUl

    addBottomBtn.addEventListener('click', () => {
        addToList(newItemInput.value.trim());
        newItemInput.value = '';
        newItemInput.focus();
    });

    addTopBtn.addEventListener('click', () => {
        addToTopOfList(newItemInput.value.trim());
        newItemInput.value = '';
        newItemInput.focus();
    });

    newItemInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            addToList(newItemInput.value.trim());
            newItemInput.value = '';
        }
    });

    // event delegation för varje knapp i todo-listan
    todoUl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if(!btn) return;
        const action = btn.dataset.action;
        const name = btn.dataset.name;
        if(!action || !name) return;

        switch(action){
            case 'moveTop': moveToTop(name); break;
            case 'moveBottom': moveToBottom(name); break;
            case 'moveUp': moveUp(name); break;
            case 'moveDown': moveDown(name); break;
            case 'done': removeFromListAndAddToDone(name); break;
            case 'remove': removeFromListByName(name); break;
        }
    });

    // Event delegation för done-listans knappar
    doneUl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if(!btn) return;
        const action = btn.dataset.action;
        const name = btn.dataset.name;
        if(!action || !name) return;

        if(action === 'removeDone'){
            removeFromDoneByName(name);
        }
    });

    // initial render
    render();
});