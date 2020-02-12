import React, { useState } from "react";

import { toMoment } from "../utils";

export function NotificationsSideBar({ show, hide, profile }) {
  const navClass = show ? "nav-sidebar" : "nav-sidebar-hidden";
  const overlayClass = show ? "nav-overlay" : "nav-overlay-hidden";
  let notifications = profile?.notifications || [];
  notifications = notifications.sort(
    (a, b) => toMoment(b.sentAt) - toMoment(a.sentAt)
  );

  return (
    <div className="nav-sidebar-wrapper">
      <label className={overlayClass} onClick={hide}>
        <div className="nav-overlay-cover" />
      </label>
      <nav className={navClass}>
        <div className="leading-loose">
          <div className="nav-sidebar-list">
            <div className="p-8">
              <label className="nav-sidebar-list-label p-8">
                <span className="nav-sidebar-list-txt">
                  Profile Notifications
                </span>
              </label>
            </div>
            {notifications.map(note => (
              <Notification
                key={note.id}
                note={note}
                viewedProfileLast={profile.viewedProfileLast}
              />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

function Notification({ note, viewedProfileLast: last }) {
  const [expanded, setExpanded] = useState(undefined);
  const { title, type, message, sentAt } = note;
  const sentAtMoment = toMoment(sentAt);
  const newNoteColors = toMoment(last).isBefore(sentAtMoment)
    ? "bg-indigo-800 text-white"
    : "";
  const contentClass = expanded === title ? "" : "hidden";
  const setAtString = sentAtMoment.format("MMM Do YYYY, h:mm a");

  return (
    <li
      key={note.id}
      className={`nav-sidebar-list-item my-4 shadow-md ${newNoteColors}`}
      onMouseEnter={() => setExpanded(title)}
      onMouseLeave={() => setExpanded(undefined)}
    >
      <label className="nav-sidebar-list-label ml-2">
        <div className="article-container">
          <div className="article-title">
            <div className={`article-title-span font-serif ${newNoteColors}`}>
              {type} | {setAtString}
              <hr />
              <div className="my-4">{title}</div>
            </div>
            <div className={contentClass}>
              <hr className="article-divider" />
              <p className="lowercase bg-gray-200 rounded-lg p-2">{message}</p>
            </div>
          </div>
        </div>
      </label>
    </li>
  );
}
