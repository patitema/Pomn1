import React, {useState} from 'react';
import './Folder.css';
import Nav from '../../components/nav/nav';
import Footer from '../../components/footer/footer';

export default function Folder() {
    document.title = "POMNI - FOLDER";
    return (
        <div>
            <Nav></Nav>
            <header>
                <div className='Hcontainer'>
                    <div className='hTextContainer'>
                        <h1>POMNI</h1>
                        <h2>BASE NAME</h2>
                    </div>
                </div>
            </header>
            <main>
                <div className='FolderContainer'>
                    <div className='navFolderView'>
                        <h3 className='FilePath'>Путь файла</h3>
                        <input className='SearchInput' type="text" placeholder='Search' />
                    </div>
                    <ul className='FileList'>
                        <li className="stroke folder"><a href="">Anal</a></li>
                        <li className="stroke"><a href="">Sex</a></li>
                        <li className="stroke"><a href="">Gay</a></li>
                        <li className="stroke"><a href="">furry</a></li>
                    </ul>
                </div>
            </main>
            <Footer></Footer>
        </div>
    );
}