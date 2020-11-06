import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { LoadingController } from "@ionic/angular";
import { SearchService } from "../services/search/search.service";

@Component({
  selector: "app-movies",
  templateUrl: "./movies.page.html",
  styleUrls: ["./movies.page.scss"],
})
export class MoviesPage implements OnInit {
  public searchForm: FormControl;

  constructor(
    private loading: LoadingController,
    private search: SearchService,
    private formBuilder: FormBuilder
  ) {}

  public async ngOnInit(): Promise<void> {
    this.searchForm = this.formBuilder.control("", [Validators.required]);
    const loading = await this.loading.create({
      animated: true,
      message: "Please Wait",
      backdropDismiss: false,
    });
    await loading.present();

    await new Promise((r) => setTimeout(() => r(), 3000));
    await loading.dismiss();

    this.searchForm.valueChanges.subscribe(console.log);
  }

  public async onSubmit(query: string): Promise<void> {
    try {
      const res = await this.search.search(query).toPromise();
      console.log(res);
    } catch (e) {
      console.error(e);
    }
  }
}
