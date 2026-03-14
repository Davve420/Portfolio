const todoList = [];
const doneList = [];

function createItem(text) {
    return {
        id: crypto.randomUUID(),
        text,
    };
}

function addToList(text) {
    if (!text) return;
    todoList.push(createItem(text));
    render();
    return todoList;
}

function addToTopOfList(text) {
    if (!text) return;
    todoList.unshift(createItem(text));
    render();
    return todoList;
}

function removeById(list, id) {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;
    return list.splice(index, 1)[0];
}

function removeFromTodoById(id) {
    const removed = removeById(todoList, id);
    render();
    return removed;
}

function removeFromDoneById(id) {
    const removed = removeById(doneList, id);
    render();
    return removed;
}

function moveToDone(id) {
    const removed = removeById(todoList, id);
    if (!removed) return;
    doneList.push(removed);
    render();
    return doneList;
}

function moveInTodo(id, targetIndex) {
    const index = todoList.findIndex((item) => item.id === id);
    if (index < 0) return;

    const [item] = todoList.splice(index, 1);
    todoList.splice(targetIndex, 0, item);
    render();
}

function moveToTop(id) {
    moveInTodo(id, 0);
}

function moveToBottom(id) {
    moveInTodo(id, todoList.length);
}

function moveDown(id) {
    const index = todoList.findIndex((item) => item.id === id);
    if (index < 0 || index === todoList.length - 1) return;
    moveInTodo(id, index + 1);
}

function moveUp(id) {
    const index = todoList.findIndex((item) => item.id === id);
    if (index <= 0) return;
    moveInTodo(id, index - 1);
}

function createActionButton(text, action, id) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.dataset.action = action;
    btn.dataset.id = id;
    return btn;
}

function render() {
    const todoUl = document.getElementById('todoUl');
    const doneUl = document.getElementById('doneUl');
    if (!todoUl || !doneUl) return;

    todoUl.innerHTML = '';
    todoList.forEach((item) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item.text;
        const actions = document.createElement('div');
        actions.className = 'actions';

        actions.appendChild(createActionButton('Top', 'moveTop', item.id));
        actions.appendChild(createActionButton('Up', 'moveUp', item.id));
        actions.appendChild(createActionButton('Down', 'moveDown', item.id));
        actions.appendChild(createActionButton('Bottom', 'moveBottom', item.id));
        actions.appendChild(createActionButton('Done', 'done', item.id));
        actions.appendChild(createActionButton('Remove', 'remove', item.id));

        li.appendChild(span);
        li.appendChild(actions);
        todoUl.appendChild(li);
    });

    doneUl.innerHTML = '';
    doneList.forEach((item) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item.text;
        const actions = document.createElement('div');
        actions.className = 'actions';

        actions.appendChild(createActionButton('Remove', 'removeDone', item.id));

        li.appendChild(span);
        li.appendChild(actions);
        doneUl.appendChild(li);
    });

    try {
        const state = { todo: todoList, done: doneList };
        localStorage.setItem('todoAppState', JSON.stringify(state));
    } catch (err) {
        console.warn('Could not save todo state:', err);
    }
}

function hydrateList(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map((item) => {
            if (typeof item === 'string') {
                return createItem(item);
            }
            if (item && typeof item.text === 'string') {
                return {
                    id: item.id || crypto.randomUUID(),
                    text: item.text,
                };
            }
            return null;
        })
        .filter(Boolean);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const raw = localStorage.getItem('todoAppState');
        if (raw) {
            const parsed = JSON.parse(raw);
            todoList.push(...hydrateList(parsed.todo));
            doneList.push(...hydrateList(parsed.done));
        }
    } catch (err) {
        console.warn('Could not load saved todo state:', err);
    }

    const addBottomBtn = document.getElementById('addBottomBtn');
    const addTopBtn = document.getElementById('addTopBtn');
    const newItemInput = document.getElementById('newItem');
    const todoUl = document.getElementById('todoUl');
    const doneUl = document.getElementById('doneUl');

    if (!addBottomBtn || !addTopBtn || !newItemInput || !todoUl || !doneUl) {
        return;
    }

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
        if (e.key === 'Enter') {
            addToList(newItemInput.value.trim());
            newItemInput.value = '';
        }
    });

    todoUl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action || !id) return;

        switch (action) {
            case 'moveTop':
                moveToTop(id);
                break;
            case 'moveBottom':
                moveToBottom(id);
                break;
            case 'moveUp':
                moveUp(id);
                break;
            case 'moveDown':
                moveDown(id);
                break;
            case 'done':
                moveToDone(id);
                break;
            case 'remove':
                removeFromTodoById(id);
                break;
            default:
                break;
        }
    });

    doneUl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (!action || !id) return;

        if (action === 'removeDone') {
            removeFromDoneById(id);
        }
    });

    render();
});
