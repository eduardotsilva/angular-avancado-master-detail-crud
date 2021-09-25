import { Component, OnInit, AfterContentChecked } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validator,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { CategoryService } from "../shared/category.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { Category } from "../shared/category.model";

@Component({
  selector: "app-category-form",
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.css"],
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  categoryForm: FormGroup;
  pagTitle: string;
  serverErroMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == "new") {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  private setPageTitle() {
    if (this.currentAction == "new") {
      this.pagTitle = "Cadastro de Nova Categoria";
    } else {
      const categoryName = this.category.name || "";
      this.pagTitle = "Editando Categoria: " + categoryName;
    }
  }

  private setCurrentAction() {
    if (this.activatedRoute.snapshot.url[0].path == "new") {
      this.currentAction = "new";
    } else {
      this.currentAction = "edit";
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
    });
  }

  private loadCategory() {
    if (this.currentAction == "edit") {
      this.activatedRoute.paramMap
        .pipe(
          switchMap((params) =>
            this.categoryService.getById(Number(params.get("id")))
          )
        )
        .subscribe(
          (categs) => {
            this.category = categs;
            this.categoryForm.patchValue(this.category); //apresenta os dados da categoria carregada do servidor
          },
          (error) => alert("Ocorreu um erro ao carregar dados no servidor!")
        );
    }
  }

  private createCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );
    this.categoryService.create(category).subscribe(
      (catgs) => this.actionsForSuccess(catgs),
      (error) => this.actionsForErros(error)
    );
  }

  private updateCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );
    this.categoryService.update(category).subscribe(
      (catgs) => this.actionsForSuccess(catgs),
      (error) => this.actionsForErros(error)
    );
  }

  private actionsForSuccess(categoria: Category) {
    toastr.success("Registro salvo com sucesso!");
    
    //Faz o redirecionamento para localhostl:4200/categories
    //skipeLocation = para não entrar no historico do navegador, para usuário não utilizar botão de voltar
    //e o navigateByUrl retorna uma promisse, que ao ser redirecionado, será executado o THEN
    //que será redirecionado para localhost:4200/categories/:id/edit
    //basicamente um reload page já editando
    this.router
      .navigateByUrl("categories", { skipLocationChange: true })
      .then(() => this.router.navigate(["categories", categoria.id, "edit"]));
  }

  private actionsForErros(error) {
    toastr.error("Ocorreu um erro ao processar registro!");
    this.submittingForm = false;

    //Numa visão onde o backend é ruby on rails
    //Tratar conforme resposta do servidor
    if (error.status === 422) {
      this.serverErroMessages = JSON.parse(error._body).erros;
    } else {
      this.serverErroMessages = ["Falha na comunicação com o servidor"]
    }
  }
}
