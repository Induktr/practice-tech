export function Home() {
  return (
    <>
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl font-bold">My App</h1>
      </header>
      <main className="p-4">
        <h2 className="text-xl font-semibold">Welcome to the Home Page</h2>
        <p>This is a simple home page.</p>
      </main>
      <footer className="bg-gray-200 p-4">
        <p>&copy; 2023 My App. All rights reserved.</p>
      </footer>
    </>
  )
};

export default Home;