import { Component, OnInit, AfterContentChecked } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { EntryService } from "../shared/entry.service";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { Category } from "../../categories/shared/category.model";
import { Entry } from "../shared/entry.model";

@Component({
  selector: "app-entry-form",
  templateUrl: "./entry-form.component.html",
  styleUrls: ["./entry-form.component.css"],
})
export class EntryFormComponent implements OnInit, AfterContentChecked {
  currentAction: string;
  entryForm: FormGroup;
  pagTitle: string;
  serverErroMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  category: Category = new Category();

  // imaskConfig = {
  //   mask: Number,
  //   scale: 2,
  //   thousandSeparator: '',
  //   padFractionZeros: true,
  //   normalizeZeros: true,
  //   radix: ','
  // };

  constructor(
    private entryService: EntryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == "new") {
      this.createEntry();
    } else {
      this.updateCategory();
    }
  }

  private setPageTitle() {
    if (this.currentAction == "new") {
      this.pagTitle = "Cadastro de novo lançamento";
    } else {
      const categoryName = this.category.name || "";
      this.pagTitle = "Editando lançamento de Categoria: " + categoryName;
    }
  }

  private setCurrentAction() {
    if (this.activatedRoute.snapshot.url[0].path == "new") {
      this.currentAction = "new";
    } else {
      this.currentAction = "edit";
    }
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      amount: [null, [Validators.required]],
    });
  }

  private loadEntry() {
    if (this.currentAction == "edit") {
      this.activatedRoute.paramMap
        .pipe(
          switchMap((params) =>
            this.entryService.getById(Number(params.get("id")))
          )
        )
        .subscribe(
          (categs) => {
            this.category = categs;
            this.entryForm.patchValue(this.category); //apresenta os dados da categoria carregada do servidor
          },
          (error) => alert("Ocorreu um erro ao carregar dados no servidor!")
        );
    }
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.create(entry).subscribe(
      (responseEntry) => this.actionsForSuccess(responseEntry),
      (error) => this.actionsForErros(error)
    );
  }

  private updateCategory() {
    const entry: Entry = Object.assign(new Category(), this.entryForm.value);
    this.entryService.update(entry).subscribe(
      (response) => this.actionsForSuccess(response),
      (error) => this.actionsForErros(error)
    );
  }

  private actionsForSuccess(entry: Entry) {
    toastr.success("Registro salvo com sucesso!");

    //Faz o redirecionamento para localhostl:4200/categories
    //skipeLocation = para não entrar no historico do navegador, para usuário não utilizar botão de voltar
    //e o navigateByUrl retorna uma promisse, que ao ser redirecionado, será executado o THEN
    //que será redirecionado para localhost:4200/categories/:id/edit
    //basicamente um reload page já editando
    this.router
      .navigateByUrl("entries", { skipLocationChange: true })
      .then(() => this.router.navigate(["entries", entry.id, "edit"]));
  }

  private actionsForErros(error) {
    toastr.error("Ocorreu um erro ao processar registro!");
    this.submittingForm = false;

    //Numa visão onde o backend é ruby on rails
    //Tratar conforme resposta do servidor
    if (error.status === 422) {
      this.serverErroMessages = JSON.parse(error._body).erros;
    } else {
      this.serverErroMessages = ["Falha na comunicação com o servidor"];
    }
  }
}
