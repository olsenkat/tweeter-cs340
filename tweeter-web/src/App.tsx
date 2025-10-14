import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { AuthenticationView } from "./presenter/AuthenticationPresenter";
import { LoginPresenter } from "./presenter/LoginPresenter";
import { RegisterPresenter, RegisterView } from "./presenter/RegisterPresenter";
import { ToasterPresenter, ToasterView } from "./presenter/ToasterPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { UserNavigationHooksPresenter, UserNavigationHooksView } from "./presenter/UserNavigationHooksPresenter";
import UserItem from "./components/userItem/UserItem";
import StatusItem from "./components/statusItem/StatusItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster
        position="top-right"
        presenterFactory={(view: ToasterView) => new ToasterPresenter(view)}
      />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const itemPresenterFactory = (view: UserNavigationHooksView) => {
    return new UserNavigationHooksPresenter(view)
  }

  const statusItemComponentFactory = (item: Status, featurePath: string) => {
    return <StatusItem
      status={item}
      featurePath={featurePath}
      presenterFactory={itemPresenterFactory}
    />
  }
  
  const userItemComponentFactory = (item: User, featurePath: string) => {
    return <UserItem
      user={item}
      featurePath={featurePath}
      presenterFactory={itemPresenterFactory}
    />
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller
              key={`feed-${displayedUser!.alias}`}
              featureUrl="/feed"
              presenterFactory={(view: PagedItemView<Status>) =>
                new FeedPresenter(view)
              }
              itemComponentFactory={statusItemComponentFactory}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller
              key={`story-${displayedUser!.alias}`}
              featureUrl="/story"
              presenterFactory={(view: PagedItemView<Status>) =>
                new StoryPresenter(view)
              }
              itemComponentFactory={statusItemComponentFactory}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller
              key={`followees-${displayedUser!.alias}`}
              featureUrl="/followees"
              presenterFactory={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentFactory={userItemComponentFactory}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller
              key={`followers-${displayedUser!.alias}`}
              featureUrl="/followers"
              presenterFactory={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentFactory={userItemComponentFactory}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Login
            originalUrl={location.pathname}
            presenterFactory={(view: AuthenticationView) =>
              new LoginPresenter(view)
            }
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            originalUrl={location.pathname}
            presenterFactory={(view: RegisterView) =>
              new RegisterPresenter(view)
            }
          />
        }
      />
      <Route
        path="*"
        element={
          <Login
            originalUrl={location.pathname}
            presenterFactory={(view: AuthenticationView) =>
              new LoginPresenter(view)
            }
          />
        }
      />
    </Routes>
  );
};

export default App;
