import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

export const GET_ROTO_ARTICLES = gql`
  query getRotoNflArticles($id: String!) {
    currentRotoArticles(id: $id) {
      title
      playerName
      team
      position
      scrapedAt
      article
    }
  }
`;

export function RotoSideBar({ show, hide }) {
  const [execute, queryResults] = useLazyQuery(GET_ROTO_ARTICLES, {
    variables: { id: "nfl" }
  });
  const { loading, error, refetch } = queryResults;
  let { data } = queryResults;
  const [showing, setShowing] = useState(false);
  const [expanded, setExpanded] = useState(undefined);
  const navClass = show ? "nav-sidebar" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";

  if (!showing && show) {
    if (refetch) {
      refetch({ variables: { id: "nfl" } }).then(function(fetched) {
        data = fetched.data;
      });
    } else {
      execute({ variables: { id: "nfl" } });
    }
    setShowing(true);
  }
  if (showing && !show) {
    setShowing(false);
  }

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        <ul className="nav-sidebar-list">
          {loading && (
            <li className="nav-sidebar-list-item">
              <div>
                <label className="nav-sidebar-list-label">
                  <span className="nav-sidebar-list-txt">Loading...</span>
                </label>
              </div>
            </li>
          )}
          {data &&
            data.currentRotoArticles &&
            data.currentRotoArticles.map((a, i) => {
              const { title, playerName, team, position, article } = a;
              const contentClass = expanded == title ? "" : "hidden";

              return (
                <li
                  key={i}
                  className="nav-sidebar-list-item"
                  onMouseEnter={() => setExpanded(title)}
                  onMouseLeave={() => setExpanded(undefined)}
                >
                  <label className="nav-sidebar-list-label">
                    <div className="article-container">
                      <div className="article-title">
                        <div className="article-title-lg-details">
                          <span className="article-title-detail-lg-span">
                            <span className="article-title-detail-value">
                              {team}
                            </span>
                          </span>
                        </div>
                        <span className="article-title-span">{title}</span>
                        <div className={contentClass}>
                          <hr className="article-divider" />
                          <div className="article-title-details">
                            <span className="article-title-detail-span">
                              {playerName}
                              <span className="article-title-detail-divider">
                                ·
                              </span>
                            </span>
                            <span className="article-title-detail-span">
                              {position}
                            </span>
                          </div>
                          <p className="lowercase">{article}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );
}
