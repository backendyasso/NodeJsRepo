import {Router} from 'express'
import * as projectController from '../controllers/projects.controller.js'
import { auth } from '../middlewares/auth.js'
import { endpoints } from '../validation/projects.endpoint.js'


const router = Router()

//router.route("/createCustomizedProject/").post(auth(endpoints.CreateProject),projectController.createCustomizedProject)
router.route("/projectCollection/:artistId").get(auth(endpoints.view),projectController.viewAllCollections)
router.route("/deleteProject/:projectId").delete(auth(endpoints.Delete), projectController.DeleteProject)
router.route("/deleteCollection/:collectionId").delete(auth(endpoints.Delete), projectController.DeleteCollection)
router.route("/specificCollection/:collectionId").get(auth(endpoints.view),projectController.viewSpecificCollection)





 export default router