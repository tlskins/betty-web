import React, { useState } from "react";

import { NavBar } from "../components/navBar";
import { RotoSideBar } from "../components/rotoSideBar";
import { RotoAlerts } from "../components/rotoAlerts";
import { ProfileSideBar } from "../components/profileSideBar";

export function Info() {
  const [showSideBar, setShowSideBar] = useState(undefined);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const signedIn = !!(profile && profile.id);

  return (
    <div className="page-layout-wrapper">
      <NavBar
        clickRoto={() => setShowSideBar("roto")}
        clickProfile={() => setShowSideBar("profile")}
      />
      <RotoSideBar
        show={showSideBar === "roto"}
        hide={() => setShowSideBar(undefined)}
      />
      <ProfileSideBar
        show={showSideBar === "profile"}
        hide={() => setShowSideBar(undefined)}
      />
      <RotoAlerts />
      <div className="page-layout">
        <div className="page-inner-layout">
          <div className="page-wrapper my-10">
            <div className="page-content">
              <div className="bg-purple-800 p-6">
                <div className="bg-white flex flex-col font-sans">
                  <div className="container mx-auto px-8 flex items-center">
                    <header className="flex flex-col sm:flex-row items-center justify-between py-6 relative">
                      <button className="flex md:hidden flex-col absolute top-0 right-0 p-4 mt-5">
                        <span className="w-5 h-px mb-1 bg-orange-500"></span>
                        <span className="w-5 h-px mb-1 bg-orange-500"></span>
                        <span className="w-5 h-px mb-1 bg-orange-500"></span>
                      </button>
                    </header>
                    <main className="flex flex-col-reverse sm:flex-row jusitfy-between items-center py-12">
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h1 className="uppercase text-6xl text-blue-900 font-bold leading-none tracking-wide mb-2">
                          Betty Bets
                        </h1>
                        <h2 className="uppercase text-4xl text-orange-500 text-secondary tracking-widest mb-6">
                          Casual Betting Platform
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-12">
                          We are a platform for creating, tracking, and
                          notifying bet results. Our twitter bot, @bettybetbot,
                          handles user registration, bet confirmation and
                          results, and allows BettyBets users to make bets with
                          users with only a twitter account.
                          <br />
                          <br />
                          We make sure to keep the record straight between you
                          and your peers! Join our betting community and start
                          betting today!
                        </p>
                        <div>
                          <a
                            href="/"
                            className="bg-purple-300 hover:bg-purple-400 py-3 px-6 uppercase text-lg font-bold text-white rounded-full m-4"
                          >
                            Current Bets
                          </a>
                          {signedIn && (
                            <a
                              href="/login"
                              className="bg-purple-300 hover:bg-purple-400 py-3 px-6 uppercase text-lg font-bold text-white rounded-full m-4"
                            >
                              Start Betting!
                            </a>
                          )}
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
