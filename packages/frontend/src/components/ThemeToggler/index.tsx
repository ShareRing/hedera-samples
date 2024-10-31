import { Button, Dropdown } from 'react-bootstrap';
import { useTheme } from '../../hooks';
import './ThemeToggler.scss';
import { ReactComponent as IconCircleHalf } from '../../assets/images/circle-half.svg';

import { ReactComponent as IconCheck2 } from '../../assets/images/check2.svg';
import { ReactComponent as IconSunFill } from '../../assets/images/sun-fill.svg';
import { ReactComponent as IconMoonStarsFill } from '../../assets/images/moon-stars-fill.svg';
import classNames from 'classnames';

function ThemeToggler() {
  const [theme, use] = useTheme();
  const ActiveThemeIcon =
    theme === 'light' ? IconSunFill : theme === 'dark' ? IconMoonStarsFill : IconCircleHalf;
  return (
    <Dropdown className="position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle">
      <Dropdown.Toggle
        as={Button}
        className="btn-bd-primary py-2 dropdown-toggle d-flex align-items-center"
      >
        <ActiveThemeIcon className="bi my-1" width="1em" height="1em" />
        <span className="visually-hidden">{theme}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu as="ul" align="end" className="shadow">
        <Dropdown.Item as="li" bsPrefix=" " onClick={() => use('light')}>
          <Button
            className={classNames(
              'dropdown-item d-flex align-items-center',
              theme === 'light' && 'active'
            )}
            variant=""
            bsPrefix=" "
          >
            <IconSunFill className="bi me-2 opacity-50" width="1em" height="1em" />
            Light
            {theme === 'light' && <IconCheck2 className="bi ms-auto" width="1em" height="1em" />}
          </Button>
        </Dropdown.Item>
        <Dropdown.Item as="li" bsPrefix=" " onClick={() => use('dark')}>
          <Button
            className={classNames(
              'dropdown-item d-flex align-items-center',
              theme === 'dark' && 'active'
            )}
            variant=""
            bsPrefix=" "
          >
            <IconMoonStarsFill className="bi me-2 opacity-50" width="1em" height="1em" />
            Dark
            {theme === 'dark' && <IconCheck2 className="bi ms-auto" width="1em" height="1em" />}
          </Button>
        </Dropdown.Item>
        <Dropdown.Item as="li" bsPrefix=" " onClick={() => use('auto')}>
          <Button
            className={classNames(
              'dropdown-item d-flex align-items-center',
              theme === 'auto' && 'active'
            )}
            variant=""
            bsPrefix=" "
          >
            <IconCircleHalf className="bi me-2 opacity-50" width="1em" height="1em" />
            Auto
            {theme === 'auto' && <IconCheck2 className="bi ms-auto" width="1em" height="1em" />}
          </Button>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ThemeToggler;
