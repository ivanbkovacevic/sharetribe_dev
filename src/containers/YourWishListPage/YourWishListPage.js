import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  ManageListingCard,
  SearchResultsPanel,
  ListingCard,
  Page,
  PaginationLinks,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  NamedLink
} from '../../components';
import { TopbarContainer } from '..';

import { closeListing, openListing, getOwnListingsById } from './YourWishListPage.duck';
import * as codeFacto from '../../codefacto'
import css from './YourWishListPage.module.css';

export class YourWishListPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = { listingMenuOpen: null, wishList: [], refresh: 0 };
    this.onToggleMenu = this.onToggleMenu.bind(this);
    this.refreshWishList = this.refreshWishList.bind(this);
    this.getWishList = this.getWishList.bind(this);
  }

  onToggleMenu(listing) {
    this.setState({ listingMenuOpen: listing });
  }

  refreshWishList() {
    let refreshh = this.state.refresh;
    this.setState({ refresh: refreshh + 1 })
    console.log('REFRESH')
  }

   async getWishList(){
    codeFacto.showWishList().then(res => {
      console.log('wiiiiiiiiiiiii', res.length)
      this.setState({ wishList: res })
    }).catch(err => {
      console.log(err)
    });
  };

  componentDidMount() {
    console.log('MOUNT')
      this.getWishList();
  }

  render() {

    const {
      closingListing,
      closingListingError,
      listings,
      onCloseListing,
      onOpenListing,
      openingListing,
      openingListingError,
      pagination,
      queryInProgress,
      queryListingsError,
      queryParams,
      scrollingDisabled,
      intl,
      currentUser,
    } = this.props;

    if (!currentUser) {
      console.log('GO TO LOG IN')
    }

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

    const loadingResults = (
      <h2>
        <FormattedMessage id="YourWishListPage.loadingOwnListings" />
      </h2>
    );

    const queryError = (
      <h2 className={css.error}>
        <FormattedMessage id="YourWishListPage.queryError" />
      </h2>
    );

    const noResults =
      listingsAreLoaded && pagination.totalItems === 0 ? (
        <h1 className={css.title}>
          <FormattedMessage id="YourWishListPage.noResults" />
        </h1>
      ) : null;

    const heading =
      listingsAreLoaded && pagination.totalItems > 0 ? (
        <h1 className={css.title}>
          <FormattedMessage
            id="YourWishListPage.youHaveListings"
            values={{ count: pagination.totalItems }}
          />
        </h1>
      ) : (
        noResults
      );

    const page = queryParams ? queryParams.page : 1;
    const paginationLinks =
      listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
        <PaginationLinks
          className={css.pagination}
          pageName="YourWishListPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError.listingId;

    const title = intl.formatMessage({ id: 'YourWishListPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');

    const linkProp = {
      text: <FormattedMessage id="YourWishListPage.yourListings" />,
      selected: true,
      linkProps: {
        name: 'LandingPage',
      },
    }

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="YourWishListPage" />
            <UserNav selectedPageName="YourWishListPage" />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            {queryInProgress ? loadingResults : null}
            {queryListingsError ? queryError : null}
            <div className={css.listingPanel}>
              <button onClick={this.refreshWishList}>REFRESH wishList</button>
              {/* {heading} */}
              <div className={css.listingCards}>
                {currentUser ?
                  this.state.wishList.map(l => (
                    <ManageListingCard
                      className={css.listingCard}
                      key={l.id.uuid}
                      listing={l}
                      isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                      actionsInProgressListingId={openingListing || closingListing}
                      onToggleMenu={this.onToggleMenu}
                      onCloseListing={onCloseListing}
                      onOpenListing={onOpenListing}
                      hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                      hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                      renderSizes={renderSizes}
                      refreshWishList={this.refreshWishList}
                    />
                  ))
                  :
                  <NamedLink name="LoginPage" className={css.link}>
                    <FormattedMessage id="YourWishListPage.login" />
                  </NamedLink>
                }
              </div>
              {paginationLinks}
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

YourWishListPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

const { arrayOf, bool, func, object, shape, string } = PropTypes;

YourWishListPageComponent.propTypes = {
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.ownListing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.YourWishListPage;

  const listings = getOwnListingsById(state, currentPageResultIds);

  const {
    currentUser
  } = state.user;


  console.log(currentPageResultIds, 'YwishlistPage')
  console.log(currentUser, 'CUrenT YWPAGE')

  return {
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
    currentUser,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
});

const YourWishListPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(YourWishListPageComponent);

export default YourWishListPage;
