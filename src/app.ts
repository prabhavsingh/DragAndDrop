/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

namespace App {
  // //Drag & Drop Interfaces
  // interface Draggable {
  //   dragStartHandler(event: DragEvent): void;
  //   dragEndHandler(event: DragEvent): void;
  // }

  // interface DragTarget {
  //   dragOverHandler(event: DragEvent): void;
  //   dropHandler(event: DragEvent): void;
  //   dragLeaveHandler(event: DragEvent): void;
  // }

  // //Project Type
  // enum ProjectStatus {
  //   Active,
  //   Finished,
  // }

  // class Project {
  //   constructor(
  //     public id: string,
  //     public title: string,
  //     public description: string,
  //     public people: number,
  //     public status: ProjectStatus
  //   ) {}
  // }

  //Project State Management
  type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  class ProjectState extends State<Project> {
    // private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
      super();
    }

    static getinstance() {
      if (this.instance) {
        return this.instance;
      }
      this.instance = new ProjectState();
      return this.instance;
    }

    // addListener(listenerFn: Listener) {
    //   this.listeners.push(listenerFn);
    // }

    addProject(title: string, description: string, numOfPeople: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.Active
      );

      this.projects.push(newProject);
      this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find((pr) => pr.id === projectId);
      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateListeners();
      }
    }

    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }
  }

  const projectState = ProjectState.getinstance();

  //Validation
  interface Validatable {
    value: string | number;
    required?: boolean; // same as required?: boolean | undefined;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  function validate(ValidatableInput: Validatable) {
    let isValid = true;
    if (ValidatableInput.required) {
      isValid =
        isValid && ValidatableInput.value.toString().trim().length !== 0;
    }
    if (
      ValidatableInput.minLength != null &&
      typeof ValidatableInput.value === "string"
    ) {
      isValid =
        isValid && ValidatableInput.value.length >= ValidatableInput.minLength;
    }
    if (
      ValidatableInput.maxLength != null &&
      typeof ValidatableInput.value === "string"
    ) {
      isValid =
        isValid && ValidatableInput.value.length <= ValidatableInput.maxLength;
    }
    if (
      ValidatableInput.min != null &&
      typeof ValidatableInput.value === "number"
    ) {
      isValid = isValid && ValidatableInput.value >= ValidatableInput.min;
    }
    if (
      ValidatableInput.max != null &&
      typeof ValidatableInput.value === "number"
    ) {
      isValid = isValid && ValidatableInput.value <= ValidatableInput.max;
    }
    return isValid;
  }

  //autobind decorator
  function autobind(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalmethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = originalmethod.bind(this);
        return boundFn;
      },
    };
    return adjDescriptor;
  }

  //Conponent Base Class
  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      this.hostElement = document.getElementById(hostElementId)! as T;

      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      this.element = importedNode.firstElementChild as U;
      if (newElementId) this.element.id = newElementId;
      this.attach(insertAtStart);
    }
    private attach(insertAtBegining: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtBegining ? "afterbegin" : "beforeend",
        this.element
      );
    }

    abstract configure(): void;
    abstract renderContent(): void;
  }

  //ProjectItem class
  class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;

    get persons() {
      if (this.project.people === 1) return "1 person";
      else return `${this.project.people} persons`;
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;

      this.configure();
      this.renderContent();
    }
    @autobind
    dragStartHandler(event: DragEvent): void {
      console.log(event);
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }
    dragEndHandler(_: DragEvent): void {
      console.log("DragEnd");
    }

    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent =
        this.persons + " assigned";
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }

  // ProjectList Class
  class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      // this.templateElement = document.getElementById(
      //   "project-list"
      // )! as HTMLTemplateElement;
      // this.hostElement = document.getElementById("app")! as HTMLDivElement;
      this.assignedProjects = [];

      // const importedNode = document.importNode(
      //   this.templateElement.content,
      //   true
      // );
      // this.element = importedNode.firstElementChild as HTMLElement;
      // this.element.id = `${this.type}-projects`;

      // this.attach();
      this.configure();
      this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.add("droppable");
      }
    }

    @autobind
    dropHandler(event: DragEvent): void {
      const prjId = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(
        prjId,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.remove("droppable");
    }

    configure() {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((prj) => {
          if (this.type === "active") {
            return prj.status === ProjectStatus.Active;
          }
          return prj.status === ProjectStatus.Finished;
        });
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
    }

    renderContent() {
      const listId = `${this.type}-projects-lists`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
      const listEl = document.getElementById(
        `${this.type}-projects-lists`
      )! as HTMLUListElement;
      listEl.innerHTML = "";
      for (const projItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, projItem);
      }
    }

    // private attach() {
    //   this.hostElement.insertAdjacentElement("beforeend", this.element);
    // }
  }

  // ProjectInput Class
  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    // templateElement: HTMLTemplateElement;
    // hostElement: HTMLDivElement;
    // element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      // this.templateElement = document.getElementById(
      //   "project-input"
      // )! as HTMLTemplateElement;
      // this.hostElement = document.getElementById("app")! as HTMLDivElement;

      // const importedNode = document.importNode(
      //   this.templateElement.content,
      //   true
      // );
      // this.element = importedNode.firstElementChild as HTMLFormElement;
      // this.element.id = "user-input";

      this.titleInputElement = this.element.querySelector(
        "#title"
      ) as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector(
        "#description"
      ) as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector(
        "#people"
      ) as HTMLInputElement;
      this.configure();
      // this.attach();
    }

    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent() {}

    private clearInput() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }

    private gatheruserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElement.value;

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true,
      };
      const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };
      const peopleValidatable: Validatable = {
        value: enteredPeople,
        required: true,
        min: 1,
      };

      if (
        //   enteredTitle.trim().length === 0 ||
        //   enteredDescription.trim().length === 0 ||
        //   enteredPeople.trim().length === 0
        !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ) {
        alert("Invalid input, please try again!");
        return;
      } else {
        return [enteredTitle, enteredDescription, +enteredPeople];
      }
    }

    @autobind
    private submitHandler(event: Event) {
      event.preventDefault();
      console.log(this.titleInputElement.value);
      const userInput = this.gatheruserInput();
      if (Array.isArray(userInput)) {
        const [title, desc, people] = userInput;
        projectState.addProject(title, desc, people);
        this.clearInput();
      }
    }

    // private attach() {
    //   this.hostElement.insertAdjacentElement("afterbegin", this.element);
    // }
  }

  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
