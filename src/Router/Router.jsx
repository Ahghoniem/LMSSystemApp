import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router";
import App from "../App";
import Home from "../Layouts/Home";
import Login from "../Auth/Login/Login";
import RegisterForm from "../Auth/Regiester/Regiester";
import PutEmail from "../Auth/VerifyMail/VerifyMail";
import OTP from "../Auth/OTP/OTP";
import VerifyGuard from "../Middleware/VerifyGuard";
import ResetPassword from "../Auth/ResetPassword/ResetPassword";
import Userprofile from "../Modules/Client/Profile/Userprofile";
import OTPGuard from "../Middleware/OTPGuard";
import LoginGuard from "../Middleware/LoginGuard";
import Dashboard from "../Modules/Admin/Dashboard/Dashboard";
import RoleGuard from "../Middleware/RoleGuard";
import UserGuard from "../Middleware/UserGuard";
import AdminGuard from "../Middleware/AdminGuard";
import RejectedUsersTable from "../Modules/Admin/Manage-rejected-users";
import UsersTable from "../Modules/Admin/Manage-users";
import UserDetails from "../Modules/Admin/Manage-users/User-Details/UserDetails";
import UserGrades from "../Modules/Admin/Manage-users/User-Grades/UserGrades";
import AdminExamResults from "../Modules/Admin/Manage-events/ExamResults/AdminExamResults";
import AddEvent from "../Modules/Admin/Add-events/AddEvent";
import EventDetails from "../Modules/Admin/Manage-events/EventDetails/EventDetails";
import EventsTable from "../Modules/Admin/Manage-events/EventsTable/EventsTable";
import AllNotifies from "../Modules/Client/Notifications/AllNotifies";
import Courses_Table from "../Modules/Client/Manage-Training/Course-Details/CourseDetails";
import AddPackage from "../Modules/Admin/Add-package/AddPackage";
import TrainingsTable from "../Modules/Trainer/Manage-sessions/TrainingsTable/TrainingsTable";
import AllSessions from "../Modules/Trainer/Manage-sessions/AllSessions/AllSessions";
import AddSession from "../Modules/Trainer/Manage-sessions/AddSession/AddSession";
import SessionAttendance from "../Modules/Trainer/Manage-sessions/SessionAttendance/SessionAttendance";
import TrainingUsers from "../Modules/Trainer/Manage-sessions/TrainingUsers/TrainingUsers";
import TrainerDashboard from "../Modules/Trainer/Dashboard/TrainerDashboard";
import ResponsiveChatApp from './../Components/Chat/Chat';
import TrainingDetails from "../Modules/Client/Training-Details";
import TrainerGuard from "../Middleware/TrainerGuard";
import CoursesTable from "../Modules/SuperAdmin/manage courses/CoursesTable";
import CourseDetails from "../Modules/SuperAdmin/manage courses/CourseDetails/CourseDetails";
import AddCourse from "../Modules/SuperAdmin/manage courses/AddCourse/AddCourse";
import SuperAdminGuard from "../Middleware/SuperAdminGuard";
import ProductsTable from './../Modules/SuperAdmin/Manage-products/ProductsTable/ProductsTable';
import ProductDetails from "../Modules/SuperAdmin/Manage-products/ProductDetails/ProductDetails";
import AddProduct from './../Modules/SuperAdmin/Add-product/AddProduct';
import ServicesTable from '../Modules/SuperAdmin/Manage-services/ServicesTable/ServicesTable';
import ServiceDetails from "../Modules/SuperAdmin/Manage-services/ServiceDetails/ServiceDetails";
import AddService from '../Modules/SuperAdmin/Add-service/AddService';
import TeamTable from "../Modules/SuperAdmin/manage team/TeamTable/TeamTable";
import AddMember from "../Modules/SuperAdmin/manage team/AddMember/AddMember";
import MemberDetails from "../Modules/SuperAdmin/manage team/MemberDetails/MemberDetails";
import TrainerTrainings from "../Modules/SuperAdmin/manage team/TrainerTrainings/TrainerTrainings";
import SupervisorExams from "../Modules/SuperAdmin/manage team/SupervisorExams/SupervisorExams";
import PermissionFiles from "../Modules/SuperAdmin/Permissions/PermissionFiles";
import AddPermissionFile from "../Modules/SuperAdmin/Permissions/AddPermissionFile";
import EditPermissionFile from "../Modules/SuperAdmin/Permissions/EditPermissionFile";
import UsersPermissions from "../Modules/SuperAdmin/Permissions/UsersPermissions";
import AuditTrail from './../Modules/SuperAdmin/Audit-Trail/AuditTrail';
import ExamsTable from "../Modules/Supervisor/Manage-exams/ExamsTable/ExamsTable";
import ExamSubscribers from "../Modules/Supervisor/Manage-exams/ExamSubscribers/ExamSubscribers";
import SupervisorDashboard from "../Modules/Supervisor/Dashboard/SupervisorDashboard";
import QRApproval from "../Auth/QR-Approval/QRApproval";
import ExamResults from "../Modules/Client/Exam-Results/ExamResults";
import ExamDetails from "../Modules/Client/Exam-Details/ExamDetails";
import UserAttendance from "../Modules/Client/UserAttendance/UserAttendance";
import RegisteredEvents from "../Modules/Client/Registered-Events/RegisteredEvents";
import PayFees from "../Modules/Client/PayFees/PayFees";
import PackagesTable from "../Modules/Admin/Manage-packages/PackagesTable/PackagesTable";
import PackageDetails from "../Modules/Admin/Manage-packages/PackageDetails/PackageDetails";
import Certificate from "../Modules/Admin/Certificate/Certificate";
import AdminProfile from './../Modules/Admin/Profile/AdminProfile';
import FinanceManagement from "../Modules/Admin/Finance/FinanceManagement/FinanceManagement";
import SystemData from './../Modules/SuperAdmin/System-data/SystemData';
import ReceiptsTable from "../Modules/SuperAdmin/Manage-Receipts/ReceiptsTable";

export const routes = createBrowserRouter(
  createRoutesFromElements(
   <>
   //*================================================================================
                                //*TODO: General ROUTES
      //*=================================================================================
    <Route path="/" element={<App />}>
      <Route index path="/" element={<RoleGuard to={"/admin/dashboard"}><Home /></RoleGuard>} />
      <Route path="/login" element={<LoginGuard to={"/"}><Login /></LoginGuard>} />
      <Route
        path="/Regiester"
        element={
          <LoginGuard to={"/"}>
            <VerifyGuard to="/verify-email">
            <RegisterForm />
          </VerifyGuard>
          </LoginGuard>
        }
      />
      <Route path="/verify-email" element={<PutEmail />} />
      <Route path="/otp" element={<OTPGuard to={"/Regiester"}><OTP /></OTPGuard>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      //*================================================================================
                                //*TODO: USER ROUTES
      //*=================================================================================
      <Route element={<UserGuard to="/admin/dashboard" />}>
      <Route path="/profile" element={<Userprofile />}/>
      <Route path="/notifications" element={<AllNotifies/>}></Route>
      <Route path="/training-details" element={<TrainingDetails/>}></Route>
      <Route path="/view-All-courses" element={<Courses_Table/>}></Route>
      <Route path="/User-chats" element={<ResponsiveChatApp/>}/>
      <Route path="/Attendance" element={<QRApproval/>}></Route>
      <Route path="/exam-results" element={<ExamResults/>}></Route>
      <Route path="/exam-details" element={<ExamDetails/>}></Route>
      <Route path="/Attendance-details" element={<UserAttendance/>}></Route>
      <Route path="/registered-events" element={<RegisteredEvents/>}></Route>
      <Route path="/pay-fees" element={<PayFees/>}></Route>
      </Route>

      //*================================================================================
                                //*TODO: ADMIN ROUTES
      //*=================================================================================

      <Route element={<AdminGuard to={'/'}/>}>
      <Route path="/admin/dashboard" element={<Dashboard />}/>
      <Route path="/admin/profile" element={<AdminProfile />}/>
      <Route path="/admin/rejected-users" element={<RejectedUsersTable/>}></Route>
      <Route path="/admin/manage-users" element={<UsersTable/>}></Route>
      <Route path="/admin/edit-user" element={<UserDetails/>}></Route>
      <Route path="/admin/user-grades/:id" element={<UserGrades/>}></Route>
      <Route path="/admin/AddEvents" element={<AddEvent/>}></Route>
      <Route path="/admin/manage-events" element={<EventsTable/>}></Route>
      <Route path="/admin/events/:id" element={<EventDetails/>}></Route>
      <Route path="/admin/training-details/:id" element={<EventDetails/>}></Route>
      <Route path="/admin/exam-details/:id" element={<EventDetails/>}></Route>
      <Route path="/admin/exam-results/:id" element={<AdminExamResults/>}></Route>
      <Route path="/admin/Add-package" element={<AddPackage/>}></Route>
      <Route path="/admin/manage-packages" element={<PackagesTable/>}></Route>
      <Route path="/admin/package-details/:id" element={<PackageDetails/>}></Route>
      <Route path="/admin/finance-management" element={<FinanceManagement/>}></Route>
      <Route path="/admin/manage-courses" element={<CoursesTable />} />
      <Route path="/admin/course-details/:id" element={<CourseDetails />} />
      <Route path="/admin/add-course" element={<AddCourse />} />
      <Route path="/admin/manage-products" element={<ProductsTable />} />
      <Route path="/admin/product-details/:id" element={<ProductDetails />} />
      <Route path="/admin/add-product" element={<AddProduct />} />
      <Route path="/admin/manage-services" element={<ServicesTable />} />
      <Route path="/admin/service-details/:id" element={<ServiceDetails />} />
      <Route path="/admin/add-service" element={<AddService />} />
      <Route path="/admin/manage-team" element={<TeamTable />} />
      <Route path="/admin/add-trainer" element={<AddMember />} />
      <Route path="/admin/member-details" element={<MemberDetails />} />
      <Route path="/admin/trainer-trainings/:id" element={<TrainerTrainings />} />
      <Route path="/admin/supervisor-exams/:id" element={<SupervisorExams />} />
      <Route path="/admin/statement-requests" element={<Certificate/>}></Route>
      </Route>

      //*================================================================================
                                //*TODO: SUPER ADMIN ROUTES
      //*=================================================================================

        <Route element={<SuperAdminGuard to={'/'}/>}>
            <Route path="/superadmin/dashboard" element={<Dashboard />} />
            <Route path="/superadmin/profile" element={<AdminProfile />}/>
            <Route path="/superadmin/manage-courses" element={<CoursesTable />} />
            <Route path="/superadmin/course-details/:id" element={<CourseDetails />} />
            <Route path="/superadmin/add-course" element={<AddCourse />} />
            <Route path="/superadmin/manage-products" element={<ProductsTable />} />
            <Route path="/superadmin/product-details/:id" element={<ProductDetails />} />
            <Route path="/superadmin/add-product" element={<AddProduct />} />
            <Route path="/superadmin/manage-services" element={<ServicesTable />} />
            <Route path="/superadmin/service-details/:id" element={<ServiceDetails />} />
            <Route path="/superadmin/add-service" element={<AddService />} />
            <Route path="/superadmin/manage-team" element={<TeamTable />} />
            <Route path="/superadmin/add-trainer" element={<AddMember />} />
            <Route path="/superadmin/member-details" element={<MemberDetails />} />
            <Route path="/superadmin/trainer-trainings/:id" element={<TrainerTrainings />} />
            <Route path="/superadmin/supervisor-exams/:id" element={<SupervisorExams />} />
            <Route path="/superadmin/permission-files" element={<PermissionFiles />} />
            <Route path="/superadmin/add-permission-file" element={<AddPermissionFile />} />
            <Route path="/superadmin/edit-permission-file/:id" element={<EditPermissionFile />} />
            <Route path="/superadmin/users-permissions" element={<UsersPermissions />} />
            <Route path="/superadmin/statement-requests" element={<Certificate/>}></Route>
            <Route path="/superadmin/system-logs" element={<AuditTrail />} />
            <Route path="/superadmin/rejected-users" element={<RejectedUsersTable/>}></Route>
            <Route path="/superadmin/manage-users" element={<UsersTable/>}></Route>
            <Route path="/superadmin/edit-user" element={<UserDetails/>}></Route>
            <Route path="/superadmin/user-grades/:id" element={<UserGrades/>}></Route>
            <Route path="/superadmin/AddEvents" element={<AddEvent/>}></Route>
            <Route path="/superadmin/manage-events" element={<EventsTable/>}></Route>
            <Route path="/superadmin/events/:id" element={<EventDetails/>}></Route>
            <Route path="/superadmin/training-details/:id" element={<EventDetails/>}></Route>
            <Route path="/superadmin/exam-details/:id" element={<EventDetails/>}></Route>
            <Route path="/superadmin/exam-results/:id" element={<AdminExamResults/>}></Route>
            <Route path="/superadmin/Add-package" element={<AddPackage/>}></Route>
            <Route path="/superadmin/manage-packages" element={<PackagesTable/>}></Route>
            <Route path="/superadmin/package-details/:id" element={<PackageDetails/>}></Route>
            <Route path="/superadmin/finance-management" element={<FinanceManagement/>}></Route>
            <Route path="/superadmin/receipts-management" element={<ReceiptsTable/>}></Route>
            <Route path="/superadmin/system-data" element={<SystemData/>}></Route>
        </Route>
        


      //*================================================================================
                                //*TODO: TRAINER ROUTES
      //*=================================================================================

      <Route element={<TrainerGuard to={"/trainer/dashboard"}/>}>
      <Route path="/trainer/dashboard" element={<TrainerDashboard/>}></Route>
      <Route path="/trainer/profile" element={<AdminProfile />}/>
      <Route path="/trainer/manage-trainings" element={<TrainingsTable/>}></Route>
      <Route path="/trainer/all-sessions" element={<AllSessions/>}></Route>
      <Route path="/trainer/add-session" element={<AddSession/>}></Route>
      <Route path="/trainer/session-attendance" element={<SessionAttendance/>}></Route>
      <Route path="/trainer/training-users" element={<TrainingUsers/>}></Route>
      <Route path="/trainer-chats" element={<ResponsiveChatApp/>}/>
      <Route path="/trainer/rejected-users" element={<RejectedUsersTable/>}></Route>
      <Route path="/trainer/manage-users" element={<UsersTable/>}></Route>
      <Route path="/trainer/edit-user" element={<UserDetails/>}></Route>
      <Route path="/trainer/user-grades/:id" element={<UserGrades/>}></Route>
      <Route path="/trainer/AddEvents" element={<AddEvent/>}></Route>
      <Route path="/trainer/manage-events" element={<EventsTable/>}></Route>
      <Route path="/trainer/events/:id" element={<EventDetails/>}></Route>
      <Route path="/trainer/training-details/:id" element={<EventDetails/>}></Route>
      <Route path="/trainer/exam-details/:id" element={<EventDetails/>}></Route>
      <Route path="/trainer/exam-results/:id" element={<AdminExamResults/>}></Route>
      <Route path="/trainer/Add-package" element={<AddPackage/>}></Route>
      <Route path="/trainer/manage-packages" element={<PackagesTable/>}></Route>
      <Route path="/trainer/package-details/:id" element={<PackageDetails/>}></Route>
      <Route path="/trainer/finance-management" element={<FinanceManagement/>}></Route>
      <Route path="/trainer/manage-courses" element={<CoursesTable />} />
      <Route path="/trainer/course-details/:id" element={<CourseDetails />} />
      <Route path="/trainer/add-course" element={<AddCourse />} />
      <Route path="/trainer/manage-products" element={<ProductsTable />} />
      <Route path="/trainer/product-details/:id" element={<ProductDetails />} />
      <Route path="/trainer/add-product" element={<AddProduct />} />
      <Route path="/trainer/manage-services" element={<ServicesTable />} />
      <Route path="/trainer/service-details/:id" element={<ServiceDetails />} />
      <Route path="/trainer/add-service" element={<AddService />} />
      <Route path="/trainer/manage-team" element={<TeamTable />} />
      <Route path="/trainer/add-trainer" element={<AddMember />} />
      <Route path="/trainer/member-details" element={<MemberDetails />} />
      <Route path="/trainer/trainer-trainings/:id" element={<TrainerTrainings />} />
      <Route path="/trainer/supervisor-exams/:id" element={<SupervisorExams />} />
      <Route path="/trainer/statement-requests" element={<Certificate/>}></Route>
      </Route>
      //*================================================================================
                                //*TODO: SUPERVISOR ROUTES
      //*================================================================================
      <Route path="/supervisor/dashboard" element={<SupervisorDashboard/>}></Route>
      <Route path="/supervisor/profile" element={<AdminProfile />}/>
      <Route path="/supervisor/manage-exams" element={<ExamsTable/>}></Route>
      <Route path="/supervisor/exam-subscribers/:id" element={<ExamSubscribers/>}></Route>
      <Route path="/supervisor/supervisor-chats" element={<ResponsiveChatApp/>}/>
      <Route path="/supervisor/rejected-users" element={<RejectedUsersTable/>}></Route>
      <Route path="/supervisor/manage-users" element={<UsersTable/>}></Route>
      <Route path="/supervisor/edit-user" element={<UserDetails/>}></Route>
      <Route path="/supervisor/user-grades/:id" element={<UserGrades/>}></Route>
      <Route path="/supervisor/AddEvents" element={<AddEvent/>}></Route>
      <Route path="/supervisor/manage-events" element={<EventsTable/>}></Route>
      <Route path="/supervisor/events/:id" element={<EventDetails/>}></Route>
      <Route path="/supervisor/training-details/:id" element={<EventDetails/>}></Route>
      <Route path="/supervisor/exam-details/:id" element={<EventDetails/>}></Route>
      <Route path="/supervisor/exam-results/:id" element={<AdminExamResults/>}></Route>
      <Route path="/supervisor/Add-package" element={<AddPackage/>}></Route>
      <Route path="/supervisor/manage-packages" element={<PackagesTable/>}></Route>
      <Route path="/supervisor/package-details/:id" element={<PackageDetails/>}></Route>
      <Route path="/supervisor/finance-management" element={<FinanceManagement/>}></Route>
      <Route path="/supervisor/manage-courses" element={<CoursesTable />} />
      <Route path="/supervisor/course-details/:id" element={<CourseDetails />} />
      <Route path="/supervisor/add-course" element={<AddCourse />} />
      <Route path="/supervisor/manage-products" element={<ProductsTable />} />
      <Route path="/supervisor/product-details/:id" element={<ProductDetails />} />
      <Route path="/supervisor/add-product" element={<AddProduct />} />
      <Route path="/supervisor/manage-services" element={<ServicesTable />} />
      <Route path="/supervisor/service-details/:id" element={<ServiceDetails />} />
      <Route path="/supervisor/add-service" element={<AddService />} />
      <Route path="/supervisor/manage-team" element={<TeamTable />} />
      <Route path="/supervisor/add-trainer" element={<AddMember />} />
      <Route path="/supervisor/member-details" element={<MemberDetails />} />
      <Route path="/supervisor/trainer-trainings/:id" element={<TrainerTrainings />} />
      <Route path="/supervisor/supervisor-exams/:id" element={<SupervisorExams />} />
      <Route path="/supervisor/statement-requests" element={<Certificate/>}></Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/r" element={<RegisterForm/>}></Route>
    </Route>
   </>
  )
);