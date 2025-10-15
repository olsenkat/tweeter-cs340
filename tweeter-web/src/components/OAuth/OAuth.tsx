import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useMessageActions } from "../toaster/MessageHooks";
import { OAuthPresenter } from "../../presenter/OAuthPresenter";
import { useRef } from "react";
import { MessageView } from "../../presenter/Presenter";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type OAuthProvider = "Google" | "Facebook" | "Twitter" | "LinkedIn" | "GitHub";

interface Props {
  presenterFactory: (view: MessageView) => OAuthPresenter;
}

const OAuth = (props: Props) => {
  const { displayInfoMessage, displayErrorMessage, deleteMessage } =
    useMessageActions();

  const listener: MessageView = {
    deleteMessage: deleteMessage,
    displayErrorMessage: displayErrorMessage,
    displayInfoMessage: displayInfoMessage,
  }; // Observer

  const presenterRef = useRef<OAuthPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  const OAUTH_FUNCTIONS = {
    Google: () => presenterRef.current!.handleGoogleClick(),
    Facebook: () => presenterRef.current!.handleFacebookClick(),
    Twitter: () => presenterRef.current!.handleTwitterClick(),
    LinkedIn: () => presenterRef.current!.handleLinkedInClick(),
    GitHub: () => presenterRef.current!.handleGithubClick(),
  };

  const getBrandIcon = (serviceName: string): IconProp => {
    return ["fab", serviceName.toLowerCase()] as IconProp;
  };

  const buttonAction = (
    serviceName: OAuthProvider,
    tooltipID: string
  ): JSX.Element => {
    return (
      <button
        type="button"
        className="btn btn-link btn-floating mx-1"
        onClick={() => OAUTH_FUNCTIONS[serviceName]()}
      >
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={tooltipID}>{serviceName}</Tooltip>}
        >
          <FontAwesomeIcon icon={getBrandIcon(serviceName)} />
        </OverlayTrigger>
      </button>
    );
  };
  return (
    <div className="text-center mb-3">
      {buttonAction("Google", "googleTooltip")}
      {buttonAction("Facebook", "facebookTooltip")}
      {buttonAction("Twitter", "twitterTooltip")}
      {buttonAction("LinkedIn", "linkedInTooltip")}
      {buttonAction("GitHub", "githubTooltip")}
    </div>
  );
};

export default OAuth;
