"use client";

import { useEffect, useState } from 'react';
// import localFont from "next/font/local";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default function Home() {
  const [data, setData] = useState<string | "">();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        console.log("process.env.URL", process.env.NEXT_PUBLIC_API_URL);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`);
        console.log("response", response);
        const json = await response.json();
        console.log(json);
        setData(json);
      } catch (error) {
        setData('No data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data ? JSON.stringify(data) : 'No data'}
    </div>
  );
}
