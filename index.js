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
 *
 *       I was debating on wether or not to combine all api calls in a single function, but i decided
 *       to keep it separated, because even though i could save some lines of code, readability is a lot
 *       more clear if they stay separate. On top of that, the fact that they have such different needs in
 *       terms of body/not body, id/no id, meant that the options object would change for every call
 *       so the lines that would have been omitted were not that significantly considerable
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
 *
 *          Some of the event listeners were injected into the HTML because that way, bubbling leads to the right
 *          tag being the "current target", if for example it the event listener was put into an outer container
 *          it would be a lot more complicated getting to its child (who is not the target either), one option would
 *          have been to use parent methods
 */

const view = (() => {
    const editMode = { state: false, currentID: undefined };

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

            const title =
                editMode.state && +editMode.currentID === +obj.id
                    ? `<input onkeyup="controller.submitEdit(event, ${editMode.currentID})" value="${obj.content}"></input>`
                    : `<span>${obj.content}</span>`;

            if (obj.isCompleted) {
                templateCompleted += `
                <li class="list-element ${obj.id}" id=${obj.id}>
                    <div class="todo-text">
                        ${title}
                    </div>
                    <div class="todo-buttons">
                    <button class="edit ${obj.id}" > ${editIcon} </button>
                    <button class="delete ${obj.id}" onclick="controller.deleteTodo(event)"> ${deleteIcon} </button>
                    <button class="complete-status ${obj.id}" onclick="controller.changeStatusTodo(event)"> ${arrowLIcon} </button>
                </li>
                `;
            } else {
                templatePending += `
                <li class="list-element ${obj.id}" id=${obj.id}">
                    <div class="todo-text">
                        ${title}
                    </div>
                    <div class="todo-buttons">
                    <button class="edit ${obj.id}" > ${editIcon} </button>
                    <button class="delete ${obj.id}" onclick="controller.deleteTodo(event)"> ${deleteIcon} </button>
                    <button class="complete-status ${obj.id}" onclick="controller.changeStatusTodo(event)"> ${arrowRIcon} </button>
                </li>
                `;
            }
        });
        editMode.state = false;
        editMode.currentID = undefined;
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
        editMode,
    };
})();

/**
 * @model => This function tkes care of everything related the data/data model, in short it contains classes designed
 *           to model class models to describe the data. In other words, a class will be specified so its properties
 *           can contain the data structure returned from the api.
 *
 *           The model contain one of the most important things in the script, which is the setter. It basically allows
 *           to run a re render everytime there exists a change on the todoList by just reasigning it to a new value
 *
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
 *                 objects created previously and see its execution through, also contains the addition
 *                 of event listeners as well as the functions to be executed from the html event listeners
 *
 *                 The controller is by far the most important piece of code in the script, it allows the entire we app
 *                 to function, it puts together.
 *
 *                 All of the event listeners that were placed into elements that had multiple level of stacking were put
 *                 into the html tags, to make the most out of the bubbling property. Nonetheless, the @addNewTodo function
 *                 does inject the listener through "addeventlistener". In fact, 2 separate listeners were added here
 *                 one for the button and one for the enter key in case the user decides to use that instead
 *
 *                 @editTodo was by FAR the hardest one to implement, because not only one of the inner elements had to be replaced
 *                 by an entirely different tag, listeners haad to be created (and then removed) taking bubbling into account, getting
 *                 to the right parent/child proved to be a bit challenging, on top of that regex had to be used in order to identify and replace
 *                 the elements in the inner HTML and replace them. A combination of html listeners and javascript listener implementations were
 *                 combined for this part. the HTML listener was put into place, specifically to submit to the api and reset the inner content
 *                 Finally, similarly to the @addTodo function, it has to be called every time the page is rendered, and that means insdide
 *                 the then methos of various API calls
 *
 *                 @deleteTodo records the id of the element that the user wants to delete, removes it from the backend, and finally
 *                 re-renders the page excluding the element
 *
 *                 @changeStatusTodo changes the data inside of "isCompleted", and rearranges the todos by re rendering, there exists
 *                 an If statement that classifies each todo based on its completion status
 *
 *                 Finally @init puts everything together, it is the only function called in this script
 *
 */

const controller = ((model, view) => {
    const state = new model.state();

    const addNewTodo = () => {
        const inputBar = document.querySelector(view.viewElements.inputBar);
        const submitButton = document.querySelector(view.viewElements.submitButton);

        inputBar.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const todo = new model.todo(event.target.value);
                const response = model.postData("POST", "todos", todo);
                response.then((todo) => {
                    state.todoList = [todo, ...state.todoList];
                    controller.editTodo();
                });
                event.target.value = "";
            }
        });

        submitButton.addEventListener("click", (event) => {
            const todo = new model.todo(inputBar.value);
            const response = model.postData("POST", "todos", todo);
            response.then((todo) => {
                state.todoList = [todo, ...state.todoList];
                controller.editTodo();
            });
            inputBar.value = "";
        });
    };

    const editTodo = (event) => {
        console.log("editTodo");
        const liElement = document.querySelectorAll(view.viewElements.liElement);

        liElement.forEach((element) => {
            element.addEventListener(
                "click",
                (event) => {
                    if (event.target.type !== undefined) {
                        const [classname, id] = event.target.className.split(" ");
                        const innerEleHTML = event.currentTarget.innerHTML;
                        event.currentTarget.innerHTML = innerEleHTML.replaceAll(
                            /<span[^>]*>([^<]+)<\/span>/g,
                            `<input onkeyup="controller.submitEdit(event, ${id})" value="${event.currentTarget.querySelector("span").textContent}"></input>`
                        );
                        if (view.editMode.currentID) {
                            view.editMode.state = true;
                        }
                        view.editMode.currentID = id;
                    } else {
                        editTodo();
                    }
                },
                { once: true }
            );
        });
    };

    const submitEdit = (event, id) => {
        const liElement = event.target.parentElement.parentElement;
        const tempTodo = new model.todo();
        if (event.key === "Enter") {
            const newTitle = event.currentTarget.value;
            model.getData("GET", ["todos", id].join("/")).then((data) => {
                tempTodo.content = newTitle;
                tempTodo.isCompleted = data.isCompleted;
                tempTodo.id = data.id;
                state.todoList.forEach((obj, i) => {
                    if (+obj.id === +id) {
                        state.todoList[i].content = newTitle;
                    }
                });
                state.todoList = [...state.todoList];
                model.putData("PUT", "todos", id, tempTodo).then(editTodo());
            });
            view.editMode.state = false;
            const innerEleHTML = liElement.innerHTML;
            liElement.innerHTML = innerEleHTML.replaceAll(/<input[^>]*onkeyup\s*=\s*["'](.+?)["']\s*[^>]*>/g, `<span>${event.currentTarget.value}</span>`);
        }
    };

    const deleteTodo = (event) => {
        if (event) {
            const [className, id] = event.currentTarget.className.split(" ");
            state.todoList = state.todoList.filter((todo) => +todo.id !== +id);
            model.delData("DELETE", "todos", id);
            controller.editTodo();
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
                    tempTodo.isCompleted = state.todoList[i].isCompleted;
                }
            });

            state.todoList = [...state.todoList];

            model.putData("PUT", "todos", id, tempTodo).then((data) => editTodo());
        }
    };

    const init = () => {
        model.getData("GET", "todos").then((todos) => {
            state.todoList = todos;
            addNewTodo();
            deleteTodo();
            editTodo();
        });
    };

    return { init, deleteTodo, editTodo, changeStatusTodo, submitEdit };
})(model, view);

controller.init();
