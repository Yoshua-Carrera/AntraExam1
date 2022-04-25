/**
 * @api => This function takes care of all the API calls (GET, POST, PUT, DELETE)
 *      It has 3 main variables (aside from the fetch functions):
 *          - url (the endpoint)
 *          - headers (for the requests)
 *          - body (for POST and PUT requests)
 *
 *       the fetch functions will take a method, a path (that joins the url) and an id if required
 *       Each fetch function will return a promise which is thenable (has then method), hence, data
 *       can be extracted that way
 */

const api = (() => {
    const url = "http://localhost:3000";

    const headers = {
        "Content-Type": "application/json",
    };

    const getData = (method, path) => {
        const response = fetch([url, path].join("/"), {
            method: method,
            mode: "cors",
            headers: headers,
        }).then((response) => response.json());

        return response;
    };

    const postData = (method, path, body) => {
        console.log(body);
        const response = fetch([url, path].join("/"), {
            method: method,
            body: JSON.stringify(body),
            mode: "cors",
            headers: headers,
        }).then((response) => response.json());

        return response;
    };

    const delData = (method, path, id) => {
        const response = fetch([url, path, id].join("/"), {
            method: method,
            mode: "cors",
            headers: headers,
        }).then((response) => response.json());

        return response;
    };

    const putData = (method, path, id, body) => {
        const response = fetch([url, path, id].join("/"), {
            method: method,
            body: JSON.stringify(body),
            mode: "cors",
            headers: headers,
        }).then((response) => response.json());

        return response;
    };

    return {
        getData,
        postData,
        delData,
        putData,
    };
})();

/**
 * @view => This function will take care of everything related to the HTML rendering and template creation
 *          its data nonetheless will come from various api calls using the @api functions previousely explained.
 *          aside from functions it contains 1 object that contains information on the main html elements which will
 *          be used throughout the script, the string specified for each one is its class name.
 *
 *          The create template function will take an array of objects coming from an api and loop through it
 *          using a for each, the callback function provided for this for each will append new blocks of HTML
 *          in the form of a string which is called template
 *
 *          The render function will take the template resulting from the previous function and inject it into
 *          the inner html of the target html element
 */

const view = (() => {
    const viewElements = {
        ulComplete: ".complete",
        ulPending: ".pending",
        inputBar: ".inputBar",
        submitButton: ".submit",
        editButton: ".edit",
        deleteButton: ".delete",
        completeStatusButton: ".complete-status",
        liElement: ".list-element",
    };

    const createTemplate = (dataArray) => {
        let templateCompleted = "";
        let templatePending = "";

        dataArray.forEach((obj) => {
            const editIcon = `<svg style="pointer-events:none;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path style="pointer-events:none;" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`;

            const deleteIcon = `<svg style="pointer-events:none;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path style="pointer-events:none;" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;

            const arrowLIcon = `<svg style="pointer-events:none;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowBackIcon" aria-label="fontSize small"><path style="pointer-events:none;" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>`;

            const arrowRIcon = `<svg style="pointer-events:none;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small"><path style="pointer-events:none;" d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`;

            if (obj.isCompleted) {
                templateCompleted += `
                <li class="list-element ${obj.id}" id=${obj.id} >
                    <div class="todo-text">
                        <span>${obj.content}</span>
                    </div>
                    <div class="todo-buttons">
                    <button class="edit ${obj.id}" > ${editIcon} </button>
                    <button class="delete ${obj.id}" onclick="controller.deleteTodo(event)"> ${deleteIcon} </button>
                    <button class="complete-status ${obj.id}" onclick="controller.changeStatusTodo(event)"> ${arrowLIcon} </button>
                </li>
                `;
            } else {
                templatePending += `
                <li class="list-element ${obj.id}" id=${obj.id} >
                    <div class="todo-text">
                        <span>${obj.content}</span>
                    </div>
                    <div class="todo-buttons">
                    <button class="edit ${obj.id}"> ${editIcon} </button>
                    <button class="delete ${obj.id}" onclick="controller.deleteTodo(event)"> ${deleteIcon} </button>
                    <button class="complete-status ${obj.id}" onclick="controller.changeStatusTodo(event)"> ${arrowRIcon} </button>
                </li>
                `;
            }
        });
        return { templateCompleted, templatePending };
    };

    const render = (templateCompleted, templatePending) => {
        const ulCompleted = document.querySelector(viewElements.ulComplete);
        const ulPending = document.querySelector(viewElements.ulPending);

        ulCompleted.innerHTML = templateCompleted;
        ulPending.innerHTML = templatePending;
    };

    return {
        viewElements,
        createTemplate,
        render,
    };
})();

/**
 * @model => This function tkes care of everything related the data/data model, in short it contains classes designed
 *           to model class models to describe the data. In other words, a class will be specified so its properties
 *           can contain the data structure returned from the api. (in the case of @class1)
 *
 *           class1 is an class`
 */

const model = ((api, view) => {
    class todo {
        constructor(content, isCompleted = false) {
            this.content = content;
            this.isCompleted = isCompleted;
        }
    }

    class state {
        #todoList = [];

        get todoList() {
            return this.#todoList;
        }

        set todoList(newDataArray) {
            this.#todoList = [...newDataArray];
            const { templateCompleted, templatePending } = view.createTemplate(this.#todoList);
            view.render(templateCompleted, templatePending);
        }
    }

    const { getData, postData, putData, delData } = api;

    return {
        getData,
        postData,
        putData,
        delData,
        todo,
        state,
    };
})(api, view);

/**
 * @controller => controls everything in the web app, it takes all the functionality from the rest of
 *              objects created previously and see its execution through, also containes the addition
 *              of event listeners as well as the functions to be executed from the html event listeners
 */

const controller = ((model, view) => {
    const state = new model.state();

    const addNewTodo = () => {
        const inputBar = document.querySelector(view.viewElements.inputBar);
        const submitButton = document.querySelector(view.viewElements.submitButton);
        const editButton = document.querySelector(view.viewElements.editButton);
        const deleteButton = document.querySelector(view.viewElements.deleteButton);
        const completeStatusButton = document.querySelector(view.viewElements.completeStatusButton);

        inputBar.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const todo = new model.todo(event.target.value);
                const response = model.postData("POST", "todos", todo);
                response.then((todo) => {
                    state.todoList = [todo, ...state.todoList];
                });
                event.target.value = "";
            }
        });

        submitButton.addEventListener("click", (event) => {
            const todo = new model.todo(inputBar.value);
            const response = model.postData("POST", "todos", todo);
            response.then((todo) => {
                console.log(todo);
                state.todoList = [todo, ...state.todoList];
            });
            inputBar.value = "";
        });
    };

    const editTodo = (event) => {
        console.log("editTodo");
        const liElement = document.querySelector(view.viewElements.liElement);
        console.log(event.target.className);
        [className, id] = event.target.className.split(" ");
        console.log(id);
        // liElement.removeEventListener("onclick", controller.editTodo(event));
        event.currentTarget.querySelector("span").innerHTML = `<input onkeyup="controller.submitEdit(event, ${id})"></input>`;
    };

    const submitEdit = (event, id) => {
        console.log(event);
        console.log(id);
        const tempTodo = new model.todo();
        if (event.key === "Enter") {
            tempTodo.title = event.target.value;
            model.putData("PUT", "todos", id);
            event.currentTarget.querySelector("span").innerHTML = `<span></span>`;
        }
    };

    const deleteTodo = (event) => {
        if (event) {
            const [className, id] = event.currentTarget.className.split(" ");
            state.todoList = state.todoList.filter((todo) => +todo.id !== +id);
            model.delData("DELETE", "todos", id);
        }
    };

    const changeStatusTodo = (event) => {
        console.log("changeStatusTodo");
        if (event) {
            const [className, id] = event.currentTarget.className.split(" ");

            const tempTodo = new model.todo();

            state.todoList.forEach((obj, i) => {
                if (+obj.id === +id) {
                    state.todoList[i].isCompleted = !state.todoList[i].isCompleted;
                    tempTodo.content = state.todoList[i].content;
                    tempTodo.isCompleted = !state.todoList[i].isCompleted;
                }
            });

            state.todoList = [...state.todoList];

            model.putData("PUT", "todos", id, tempTodo).then();
        }
    };

    const init = () => {
        model.getData("GET", "todos").then((todos) => {
            state.todoList = todos;
            addNewTodo();
            deleteTodo();
        });
    };

    return { init, deleteTodo, editTodo, changeStatusTodo, submitEdit };
})(model, view);

controller.init();
