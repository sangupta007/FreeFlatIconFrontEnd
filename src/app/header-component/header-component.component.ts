import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Helper} from '../helper.service';
import {ActivatedRoute, NavigationEnd, Params, Router} from "@angular/router";
import {Global} from "../Global.service";
import {isUndefined} from "util";
import {factoryOrValue} from "rxjs/operator/multicast";

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
  }
  ngOnDestroy(): void {

    if (this.routerEventSubscription)
      this.routerEventSubscription.unsubscribe();
  }

  headerFixed: boolean = false;
  private routerEventSubscription;
  public searchQuery:String= null;
  public userfirstName="";
  constructor( public helper: Helper, public global:Global,private activatedRoute:ActivatedRoute,
               public router: Router) {
    helper.toggleClassEvent.subscribe((HTMLClass) => {
      this.headerFixed = true;
    });
  }


  logout(){
    localStorage.clear();
    console.log('logging out');
    this.router.navigate(['/login']);
  };

  triggerAllIconObservable(newValue?:string){
    //navigate to http://localhost:4200/icons page is not already navigated
    if(this.router.url !== '/icons')
      this.router.navigate(['/icons']);
    if (!isUndefined(newValue)) {
      this.searchQuery = newValue;
      this.global.setSearchQuery(newValue);
    }
    this.helper.notifyKeywordChangeEvent.emit(newValue);

    setTimeout(()=>{
      this.helper.triggerIconGridComponentGetImages('AllIcons','POST',  this.global.getSearchQuery());

  }, 0);
    // this.helper.triggerIconGridComponentGetImages('AllIcons','POST',  newValue);

  }

  isLoggedIn(){
    // console.log(localStorage.getItem('token'));
    return localStorage.getItem('token')!== null;
  }


  ngOnInit() {
    this.helper.setLoggedInUserDetailsEvent.subscribe(
      (value) => {
        this.userfirstName = value.fullName.split(" ")[0];
      });
     this.helper.setKeywordIntoSearchBarEvent.subscribe(
       (keyword)=> {this.searchQuery=keyword}
     );


    this.router.events
      .filter(event => (event instanceof NavigationEnd))
      .subscribe((routeData: any) => {

        let currentURL = routeData.url;

        /*what does the following code do?
        * When user reloads the page...we need to show appropriate icons
        * */
        if(currentURL==='/icons'){
          setTimeout(()=>{//may not be needed
            this.helper.triggerIconGridComponentGetImages('AllIcons','POST',  this.global.getSearchQuery());
          },0);
        }
        else if(currentURL==='/dashboard/likedImages'){
          setTimeout(()=>{//may not be needed
            this.helper.triggerIconGridComponentGetImages('users/liked_images','POST');
          },0);
        }
        else if(currentURL==='/dashboard/uploadedImages'){
          setTimeout(()=>{//may not be needed
            this.helper.triggerIconGridComponentGetImages('users/uploaded','POST');
          },0);
        }
      });

  }
}
