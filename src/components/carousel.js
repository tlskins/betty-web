import React, { useState } from "react";
import { toMoment } from "../utils";

export function GamesCarousel({ games }) {
  const [page, setPage] = useState(0);
  const rows = 5;
  const pages = Math.ceil(games.length / rows);
  const skip = page * rows;
  const showingGames = games.slice(skip, skip + rows);

  const prevPage = () => {
    const idx = page === 0 ? pages - 1 : page - 1;
    setPage(idx);
  };
  const nextPage = () => {
    const idx = page === pages - 1 ? 0 : page + 1;
    setPage(idx);
  };

  return (
    <div className="flex flex-wrap -mx-4">
      <div className="w-full mb-6 px-4 flex flex-col">
        <div className="flex-grow flex flex-col bg-white border-t border-b sm:rounded sm:border shadow overflow-hidden">
          <div className="border-b">
            <div className="flex justify-between px-6 -mb-px">
              <h3 className="text-blue-700 py-4 font-normal text-lg">
                Current NBA Games
              </h3>
              <div className="flex">
                <button
                  type="button"
                  className="appearance-none py-4 text-blue-700 border-b border-blue-700 mr-3"
                  onClick={prevPage}
                >{`<`}</button>
                <button
                  type="button"
                  className="appearance-none py-4 text-blue-700 border-b border-blue-700 mr-3"
                  onClick={nextPage}
                >
                  >
                </button>
              </div>
            </div>
          </div>
          {showingGames.map((g, i) => (
            <Game game={g} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Game({ game }) {
  const { id, homeTeamName, awayTeamName, gameTime } = game;
  const title = `${awayTeamName} @ ${homeTeamName}`;
  const time = toMoment(gameTime).format("MMM D");

  return (
    <div
      key={id}
      className="flex px-6 py-6 text-grey-800 justify-between border-b -mx-4"
    >
      <div className="px-4 items-start">{title}</div>
      <div className="px-4 items-start">({time})</div>
    </div>
  );
}
