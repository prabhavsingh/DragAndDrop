/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../util/validation.ts"/>
/// <reference path="../state/project-state.ts"/>

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
