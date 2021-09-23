import { Component, OnInit } from "@angular/core";
import { CategoryService } from "../shared/category.service";
import { Category } from "../shared/category.model";
import { Observable } from "rxjs";

@Component({
  selector: "app-category-list",
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.css"],
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  categories$: Observable<Category[]>;

  constructor(private service: CategoryService) {}

  ngOnInit() {
    console.log("ON INIT");
    this.service.getAll().subscribe(
      (categs) => (this.categories = categs),
      (error) => alert("Errp ap carregar a lista de categorias")
    );

    // this.categories$ = this.service.getAll();
    // this.categories$.forEach( (element) => element.forEach( item => this.categories.push(item)))
  }

  deleteCategory(category: Category) {
    const mustDelete = confirm("Deseja realmente excluir a categoria ?");

    if (mustDelete) {
      this.service.delete(category.id).subscribe(
        () =>
          (this.categories = this.categories.filter(
            (item) => item != category
          )),
        () => alert("Erro ao excluir a categoria!")
      );
    }
  }
}
