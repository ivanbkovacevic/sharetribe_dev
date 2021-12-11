import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';

import { NamedLink } from '../../components';

import css from './SectionLocations.module.css';

import helsinkiImage from './images/location_helsinki.jpg';
import belgradeImage from './images/location_belgrade.jpg';
// Find a new image and save it with dimensions: 648x448
import aucklandImage from './images/location_auckland.jpg';
import rovaniemiImage from './images/location_rovaniemi.jpg';
import rukaImage from './images/location_ruka.jpg';
import  * as kocha from '../../codefacto';
class LocationImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}
const LazyImage = lazyLoadWithDimensions(LocationImage);

const locationLink = (name, image, searchQuery) => {
  const nameText = <span className={css.locationName}>{name}</span>;
  return (
    <NamedLink name="SearchPage" to={{ search: searchQuery }} className={css.location}>
      <div className={css.imageWrapper}>
        <div className={css.aspectWrapper}>
          <LazyImage src={image} alt={name} className={css.locationImage} />
        </div>
      </div>
      <div className={css.linkText}>
        <FormattedMessage
          id="SectionLocations.listingsInLocation"
          values={{ location: nameText }}
        />
      </div>
    </NamedLink>
  );
};

const SectionLocations = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);

  kocha.odmah("61b2069c-b691-4d6f-ab46-c55dff993131");
  return (
    <div className={classes}>
      <div className={css.title}>
        <FormattedMessage id="SectionLocations.title" />
      </div>
      <div className={css.locations}>
      {locationLink(
          'Belgrade',
          belgradeImage,
          '?address=Belgrade%2C%20Serbia&bounds=46.8125%2C21.4612%2C59.43.5708397%2C18.4722489&origin=60.16985569999999%2C24.93837910000002',
        )}
        {locationLink(
          'Auckland',
          aucklandImage,
          '?address=Auckland%2C%20NewZeland&bounds=-36.545%2C25.175.298%2C59.-37.047%2C174.498&origin=60.16985569999999%2C24.93837910000002'
        )}
        {locationLink(
          'Rovaniemi',
          rovaniemiImage,
          '?address=Rovaniemi%2C%20Finland&bounds=67.18452510000002%2C27.32667850000007%2C66.1553745%2C24.736871199999996&origin=66.50394779999999%2C25.729390599999988'
        )}
        {locationLink(
          'Ruka',
          rukaImage,
          '?address=Ruka%2C%20Finland&bounds=66.1704578%2C29.14246849999995%2C66.1614402%2C29.110453699999994&origin=66.16594940000002%2C29.12646110000003'
        )}
      </div>
    </div>
  );
};

SectionLocations.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

SectionLocations.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionLocations;
