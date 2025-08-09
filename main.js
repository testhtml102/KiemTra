document.addEventListener('DOMContentLoaded', function() {
	// đăng ký Service Worker
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/KiemTra/service-worker.js')
			.then(registration => {
				console.log('ServiceWorker registered: ', registration);
			})
			.catch(error => {
				console.log('ServiceWorker registration failed: ', error);
			});
		});
	}

	// Elements
	const testSelection = document.getElementById('test-selection');
	const testContainer = document.getElementById('test-container');
	const submitBtn = document.getElementById('submit-btn');
	const popUp = document.getElementById('modal');
	const backBtn = document.getElementById('back-btn');
	const confirmBtn = document.getElementById('confirm-btn');
	const timerDisplay = document.getElementById('time-left');
	const scoreDisplay = document.getElementById('score-display');
	const totalQuestionsDisplay = document.getElementById('total-questions');
	const testTitle = document.getElementById('current-test-title');
	const testList = document.querySelectorAll('.test-list')[0];

	// Variables
	let results = {pI: [], pII: [], pIII: []};
	let answeredCount = 0;
	let currentTest = null;
	let timeLeft = 0;
	let timer = null;

	// Load danh sách bài kiểm tra
	fetch('data/index.json')
	.then(response => response.json())
	.then(tests => {
		const testHtml = tests.map(test => {
			const timeLimit = (test.timeLimit && test.timeLimit > 0) ? test.timeLimit: "inf";
			return `
				<div class="test-card" data-id="${test.id}">
					<div class="test-card-header">
						<h3>${test.name}</h3>
					</div>
					<div class="test-card-body">
						<p>${test.description}</p>
						<div class="test-meta">
							<p>Thời gian: ${timeLimit} phút</p>
						</div>
					</div>
				</div>`;
		}).join('');
		testList.innerHTML = testHtml;
		testList.addEventListener('click', (e) => {
			const testCard = e.target.closest('.test-card');
			if (testCard) {
				const id = testCard.dataset.id;
				loadTest(`data/${id}.json`);
			}
		});
	});

	// Load bài kiểm tra
	function loadTest(testFile) {
		fetch(testFile)
		.then(response => response.json())
		.then(testData => {
			testSelection.classList.add('hidden');
			testContainer.classList.remove('hidden');
			startTest(testData);
		})
		.catch(error => {
			console.error('Có lỗi xảy ra:',
				error);
		});
	}

	// Initialize
	submitBtn.addEventListener('click', openPopUp);
	backBtn.addEventListener('click', backPopUp);
	confirmBtn.addEventListener('click', displayResults);

	// Functions
	function startTest(testData) {
		const pI = document.getElementById('pI');
		const pII = document.getElementById('pII');
		const pIII = document.getElementById('pIII');
		const ans = new Array("A", "B", "C", "D");
		let questions, temp, stt = 1;
		// Set test info
		totalQuestionsDisplay.textContent = testData.parts.part1.length + 4*testData.parts.part2.length + testData.parts.part3.length;
		testTitle.textContent = testData.title;
		document.getElementById('test-description').textContent = testData.description;

		// pI
		questions = testData.parts.part1;
		if (questions.length > 0) {
			temp = `<div class="part-title">Phần ${stt}: Chọn đáp án đúng</div>`;
			for (let i = 0; i < questions.length; ++i) {
				temp += `
					<div class="question" id="Iq${i + 1}">
						<div class="question-title">${questions[i].question}</div>
						<div class="options">
							<label class="option">
								<input type="radio" name="Iq${i + 1}" value="A">${questions[i].options[0]}
							</label>
							<label class="option">
								<input type="radio" name="Iq${i + 1}" value="B">${questions[i].options[1]}
							</label>
							<label class="option">
								<input type="radio" name="Iq${i + 1}" value="C">${questions[i].options[2]}
							</label>
							<label class="option">
								<input type="radio" name="Iq${i + 1}" value="D">${questions[i].options[3]}
							</label>
						</div>
					</div>`;
				results.pI.push({
					selected: null,
					correct: ans[questions[i].answer],
					isCorrect: false
				});
			} pI.innerHTML = temp;
			++stt;
		} else {
			pI.classList.add('hidden');
		}

		// pII
		questions = testData.parts.part2;
		if (questions.length > 0) {
			temp = `<div class="part-title">Phần ${stt}: Chọn đúng/sai</div>`;
			for (let i = 0; i < questions.length; ++i) {
				temp += `
					<div class="question" id="IIq${i + 1}">
						<div class="question-title">${questions[i].question}</div>
						<div class="true-false-grid">
							<div id="IIq${i + 1}a" class="true-false-abcd">
								<div class="statement">${questions[i].statements[0]}</div>
								<div class="true-false-options">
									<label><input type="radio" name="IIq${i + 1}a" value="true"> Đúng</label>
									<label><input type="radio" name="IIq${i + 1}a" value="false"> Sai</label>
								</div>
							</div>
							
							<div id="IIq${i + 1}b" class="true-false-abcd">
								<div class="statement">${questions[i].statements[1]}</div>
								<div class="true-false-options">
									<label><input type="radio" name="IIq${i + 1}b" value="true"> Đúng</label>
									<label><input type="radio" name="IIq${i + 1}b" value="false"> Sai</label>
								</div>
							</div>
							
							<div id="IIq${i + 1}c" class="true-false-abcd">
								<div class="statement">${questions[i].statements[2]}</div>
								<div class="true-false-options">
									<label><input type="radio" name="IIq${i + 1}c" value="true"> Đúng</label>
									<label><input type="radio" name="IIq${i + 1}c" value="false"> Sai</label>
								</div>
							</div>
							
							<div id="IIq${i + 1}d" class="true-false-abcd">
								<div class="statement">${questions[i].statements[3]}</div>
								<div class="true-false-options">
									<label><input type="radio" name="IIq${i + 1}d" value="true"> Đúng</label>
									<label><input type="radio" name="IIq${i + 1}d" value="false"> Sai</label>
								</div>
							</div>
							
						</div>
					</div>`;
				results.pII.push({
					a: {
						selected: null, correct: questions[i].answers[0], isCorrect: false
					},
					b: {
						selected: null, correct: questions[i].answers[1], isCorrect: false
					},
					c: {
						selected: null, correct: questions[i].answers[2], isCorrect: false
					},
					d: {
						selected: null, correct: questions[i].answers[3], isCorrect: false
					}
				});
			} pII.innerHTML = temp;
			++stt;
		} else {
			pII.classList.add('hidden');
		}

		// pIII
		questions = testData.parts.part3;
		if (questions.length > 0) {
			temp = `<div class="part-title">Phần ${stt}: Điền đáp án</div>`;
			for (let i = 0; i < questions.length; ++i) {
				temp += `
					<div class="question" id="IIIq${i + 1}">
						<div class="question-title">${questions[i].question}</div>
						<div class="fill-answer">
							<input type="text" name="IIIq${i + 1}" placeholder="Nhập đáp án...">
						</div>
					</div>`;
				results.pIII.push({
					answer: "",
					correct: questions[i].answer,
					isCorrect: false
				});
			} pIII.innerHTML = temp;
		} else {
			pIII.classList.add('hidden');
		}

		// Start timer
		if (testData.timeLimit === null) {
			timeLeft = 0;
			updateTimerDisplay();
			timer = setInterval(() => {
				++timeLeft;
				updateTimerDisplay();
			}, 1000);
		} else {
			timeLeft = testData.timeLimit * 60; // convert to seconds
			updateTimerDisplay();
			timer = setInterval(() => {
				--timeLeft;
				updateTimerDisplay();
	
				if (timeLeft <= 0) {
					clearInterval(timer);
					openPopUp();
				}
			},
				1000);
		}
	}

	function updateTimerDisplay() {
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;
		timerDisplay.textContent = `${minutes.toString().padStart(2,
			'0')}:${seconds.toString().padStart(2,
			'0')}`;

		// Change color when time is running out
		if (timeLeft < 60) {
			timerDisplay.style.color = '#e74c3c';
			timerDisplay.style.fontWeight = 'bold';
		}
	}

	function backPopUp() {
		popUp.classList.add('hidden');
	}

	function openPopUp() {
		let pI = [], pII = [], pIII = [];

		// pI
		for (let i = 0; i < results.pI.length; ++i) {
			const selected_answer = document.querySelector(`input[name="Iq${i + 1}"]:checked`);
			if (selected_answer) {
				results.pI[i].selected = selected_answer.value;
				results.pI[i].isCorrect = (selected_answer.value === results.pI[i].correct);
			} else {
				pI.push(`${i + 1}`);
			}
		}

		// pII
		for (let i = 0; i < results.pII.length; ++i) {
			const a_selected = document.querySelector(`input[name="IIq${i + 1}a"]:checked`);
			if (a_selected) {
				results.pII[i].a.selected = a_selected.value === 'true';
				results.pII[i].a.isCorrect = (results.pII[i].a.selected === results.pII[i].a.correct);
			} else {
				pII.push(`${i + 1}a`);
			}

			const b_selected = document.querySelector(`input[name="IIq${i + 1}b"]:checked`);
			if (b_selected) {
				results.pII[i].b.selected = b_selected.value === 'true';
				results.pII[i].b.isCorrect = (results.pII[i].b.selected === results.pII[i].b.correct);
			} else {
				pII.push(`${i + 1}b`);
			}

			const c_selected = document.querySelector(`input[name="IIq${i + 1}c"]:checked`);
			if (c_selected) {
				results.pII[i].c.selected = c_selected.value === 'true';
				results.pII[i].c.isCorrect = (results.pII[i].c.selected === results.pII[i].c.correct);
			} else {
				pII.push(`${i + 1}c`);
			}

			const d_selected = document.querySelector(`input[name="IIq${i + 1}d"]:checked`);
			if (d_selected) {
				results.pII[i].d.selected = d_selected.value === 'true';
				results.pII[i].d.isCorrect = (results.pII[i].d.selected === results.pII[i].d.correct);
			} else {
				pII.push(`${i + 1}d`);
			}
		}

		// pIII
		for (let i = 0; i < results.pIII.length; ++i) {
			const selected_answer = document.querySelector(`input[name="IIIq${i + 1}"]`).value.trim();
			if (selected_answer) {
				results.pIII[i].answer = selected_answer;
				results.pIII[i].isCorrect = (selected_answer.toLowerCase() === results.pIII[i].correct.toLowerCase());
			} else {
				pIII.push(`${i + 1}`);
			}
		}

		if (timeLeft <= 0) {
			displayResults();
		} else {
			popUp.classList.remove('hidden');
			let temp = "";
			if (pI.length + pII.length + pIII.length > 0) {
				temp = `<h3>Các câu chưa chọn: </br></h3>`;
				if (pI.length > 0) temp += `<h4> Phần trắc nghiệm: </br> ${pI.join(', ')}</h4>`;
				if (pII.length > 0) temp += `<h4> Phần đúng/sai: </br> ${pII.join(', ')}</h4>`;
				if (pIII.length > 0) temp += `<h4> Phần điền: </br> ${pIII.join(', ')}</h4>`;
				temp += `<h5> </br> Bạn nên hoàn thành tất cả các câu trước khi nộp.</h3>`;
			} else {
				temp = `<h4>Thời gian chưa hết, bạn nên kiểm tra chắc chắn rồi nộp bài để có kết quả tốt nhất.</h4>`;
			}
			document.querySelectorAll('.pop-up-container')[0].innerHTML = temp;
		}
	}

	function displayResults() {
		clearInterval(timer);
		let score = 0;

		// pI
		for (let i = 0; i < results.pI.length; ++i) {
			const q_element = document.getElementById(`Iq${i + 1}`);
			if (results.pI[i].selected === null) {
				q_element.classList.add('unanswered');
				const correctOption = document.querySelector(`input[name="Iq${i + 1}"][value="${results.pI[i].correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
			} else if (results.pI[i].isCorrect) {
				q_element.classList.add('correct');
				++score;
			} else {
				q_element.classList.add('incorrect');
				// Highlight correct answer
				const correctOption = document.querySelector(`input[name="Iq${i + 1}"][value="${results.pI[i].correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				// Highlight selected incorrect answer
				const selectedOption = document.querySelector(`input[name="Iq${i + 1}"][value="${results.pI[i].selected}"]`);
				selectedOption.parentElement.classList.add('answer-incorrect');
			}
		}

		// pII
		for (let i = 0; i < results.pII.length; ++i) {
			const a_element = document.getElementById(`IIq${i + 1}a`);
			if (results.pII[i].a.selected === null) {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}a"][value="${results.pII[i].a.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				a_element.classList.add('unanswered');
			} else if (results.pII[i].a.isCorrect) {
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}a"][value="${results.pII[i].a.selected}"]`);
				selectedOption.parentElement.classList.add('answer-correct');
				a_element.classList.add('correct');
				++score;
			} else {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}a"][value="${results.pII[i].a.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}a"][value="${results.pII[i].a.selected}"]`);
				selectedOption.parentElement.classList.add('answer-incorrect');
				a_element.classList.add('incorrect');
			}

			const b_element = document.getElementById(`IIq${i + 1}b`);
			if (results.pII[i].b.selected === null) {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}b"][value="${results.pII[i].b.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				b_element.classList.add('unanswered');
			} else if (results.pII[i].b.isCorrect) {
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}b"][value="${results.pII[i].b.selected}"]`);
				selectedOption.parentElement.classList.add('answer-correct');
				b_element.classList.add('correct');
				++score;
			} else {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}b"][value="${results.pII[i].b.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}b"][value="${results.pII[i].b.selected}"]`);
				selectedOption.parentElement.classList.add('answer-incorrect');
				b_element.classList.add('incorrect');
			}

			const c_element = document.getElementById(`IIq${i + 1}c`);
			if (results.pII[i].c.selected === null) {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}c"][value="${results.pII[i].c.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				c_element.classList.add('unanswered');
			} else if (results.pII[i].c.isCorrect) {
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}c"][value="${results.pII[i].c.selected}"]`);
				selectedOption.parentElement.classList.add('answer-correct');
				c_element.classList.add('correct');
				++score;
			} else {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}c"][value="${results.pII[i].c.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}c"][value="${results.pII[i].c.selected}"]`);
				selectedOption.parentElement.classList.add('answer-incorrect');
				c_element.classList.add('incorrect');
			}

			const d_element = document.getElementById(`IIq${i + 1}d`);
			if (results.pII[i].d.selected === null) {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}d"][value="${results.pII[i].d.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				d_element.classList.add('unanswered');
			} else if (results.pII[i].d.isCorrect) {
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}d"][value="${results.pII[i].d.selected}"]`);
				selectedOption.parentElement.classList.add('answer-correct');
				d_element.classList.add('correct');
				++score;
			} else {
				const correctOption = document.querySelector(`input[name="IIq${i + 1}d"][value="${results.pII[i].d.correct}"]`);
				correctOption.parentElement.classList.add('answer-correct');
				const selectedOption = document.querySelector(`input[name="IIq${i + 1}d"][value="${results.pII[i].d.selected}"]`);
				selectedOption.parentElement.classList.add('answer-incorrect');
				d_element.classList.add('incorrect');
			}
		}

		// pIII
		for (let i = 0; i < results.pIII.length; ++i) {
			const q_element = document.getElementById(`IIIq${i + 1}`);
			const q_input = document.querySelector(`input[name="IIIq${i + 1}"]`);
			if (results.pIII[i].answer === "") {
				q_element.classList.add('unanswered');
				const correctSpan = document.createElement('span');
				correctSpan.textContent = ` (Đáp án: ${results.pIII[i].correct})`;
				correctSpan.classList.add('answer-correct');
				correctSpan.style.marginLeft = '10px';
				q_input.parentElement.appendChild(correctSpan);
			} else if (results.pIII[i].isCorrect) {
				q_element.classList.add('correct');
				++score;
			} else {
				q_element.classList.add('incorrect');
				const correctSpan = document.createElement('span');
				correctSpan.textContent = ` (Đáp án: ${results.pIII[i].correct})`;
				correctSpan.classList.add('answer-correct');
				correctSpan.style.marginLeft = '10px';
				q_input.parentElement.appendChild(correctSpan);
			}
		}

		// Update score display
		scoreDisplay.textContent = score;

		//Hidden pop-up
		popUp.classList.add('hidden');

		// Disable all inputs
		document.querySelectorAll('input').forEach(input => {
			input.disabled = true;
		});

		// Change button text
		submitBtn.textContent = "Đã nộp bài";
		submitBtn.disabled = true;
	}
});
