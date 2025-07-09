import { 
  createNewHomeController, 
  getHomeController, 
  listHomesController, 
  updateHomeController, 
  deleteHomeController 
} from '../controllers/home_controller';

export const routesConfig = [
  { 
    base: "/home", 
    paths: [
      {
        path: "/",
        method: "POST",
        handler: createNewHomeController
      },
      {
        path: "/",
        method: "GET",
        handler: listHomesController
      },
      {
        path: "/:id",
        method: "GET",
        handler: getHomeController
      },
      {
        path: "/:id",
        method: "PUT",
        handler: updateHomeController
      },
      {
        path: "/:id",
        method: "DELETE",
        handler: deleteHomeController
      }
    ]
  }
];
