import appleIcon from './icon/apple-svgrepo-com.svg';
import bookmarkIcon from './icon/bookmark.svg';
import editIcon from './icon/edit.svg';
import editFilledIcon from './icon/edit (1).svg';
import envelopeIcon from './icon/envelope.svg';
import exitIcon from './icon/exit.svg';
import facebookIcon from './icon/facebook-icon.webp';
import filterIcon from './icon/filter.svg';
import homeIcon from './icon/home.svg';
import googleIcon from './icon/google-logo.svg';
import linkAltIcon from './icon/link-alt.svg';
import localFoodAppIcon from './icon/localfood-app-icon.svg';
import markerIcon from './icon/marker.svg';
import menuBurgerIcon from './icon/menu-burger.svg';
import pictureIcon from './icon/picture.svg';
import plusSmallIcon from './icon/plus-small.svg';
import searchIcon from './icon/search.svg';
import settingsIcon from './icon/settings.svg';
import shareIcon from './icon/share.svg';
import thumbtackIcon from './icon/thumbtack.svg';
import trashIcon from './icon/trash.svg';
import userAddIcon from './icon/user-add.svg';
import userIcon from './icon/user.svg';

const iconMap = {
  apple: appleIcon,
  bookmark: bookmarkIcon,
  edit: editFilledIcon,
  'edit-outline': editIcon,
  'edit-filled': editFilledIcon,
  envelope: envelopeIcon,
  exit: exitIcon,
  facebook: facebookIcon,
  filter: filterIcon,
  home: homeIcon,
  google: googleIcon,
  link: linkAltIcon,
  localfood: localFoodAppIcon,
  marker: markerIcon,
  menuBurger: menuBurgerIcon,
  picture: pictureIcon,
  plus: plusSmallIcon,
  'plus-small': plusSmallIcon,
  search: searchIcon,
  settings: settingsIcon,
  share: shareIcon,
  thumbtack: thumbtackIcon,
  trash: trashIcon,
  'user-add': userAddIcon,
  user: userIcon,
};

export default function Icon({ name, alt, className = '', ...props }) {
  const src = iconMap[name];
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={`icon-svg ${className}`.trim()}
      {...props}
    />
  );
}
