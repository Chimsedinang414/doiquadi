import bookmarkIcon from './icon/bookmark.svg';
import editIcon from './icon/edit.svg';
import envelopeIcon from './icon/envelope.svg';
import exitIcon from './icon/exit.svg';
import homeIcon from './icon/home.svg';
import markerIcon from './icon/marker.svg';
import menuBurgerIcon from './icon/menu-burger.svg';
import plusSmallIcon from './icon/plus-small.svg';
import searchIcon from './icon/search.svg';
import settingsIcon from './icon/settings.svg';
import userIcon from './icon/user.svg';

const iconMap = {
  bookmark: bookmarkIcon,
  edit: editIcon,
  envelope: envelopeIcon,
  exit: exitIcon,
  home: homeIcon,
  marker: markerIcon,
  menuBurger: menuBurgerIcon,
  plus: plusSmallIcon,
  'plus-small': plusSmallIcon,
  search: searchIcon,
  settings: settingsIcon,
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
